"use client";
import { useState, useEffect, useMemo, use } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Form,
  Input,
  Button,
  Upload,
  message,
  Avatar,
  Space,
  Popconfirm,
  Card,
  Row,
  Col,
  Typography,
  Divider,
  Spin,
  Tabs,
  Select,
  ColorPicker,
  InputNumber,
  Collapse
} from "antd";
import {
  GlobalOutlined,
  DeleteOutlined,
  EditOutlined,
  ShareAltOutlined,
  ArrowRightOutlined,
  ExportOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  LoadingOutlined,
  ExpandAltOutlined,
  SaveOutlined,
  CompressOutlined
} from "@ant-design/icons";
import {
  useAppKitProvider,
  useAppKitAccount,
  useAppKitState
} from "@reown/appkit/react";
import { BrowserProvider } from "ethers";
import ProfileCard from "@/app/components/ProfileCard";
import {
  linkFolioContract,
  supportedSocials,
  subgraphClient as client,
  GET_PROFILE_QUERY,
  DEFAULT_APPEARANCE_SETTINGS
} from "@/app/utils";
import { profileTemplates } from "@/app/utils/profileTemplates";
import {
  EXPLORER_URL,
  LINKFOLIO_CONTRACT_ADDRESS,
  PINATA_GATEWAY_URL
} from "@/app/utils/constants";
import { executeOperation, getAAWalletAddress } from "@/app/utils/aaUtils";
import {
  uploadProfileSettingsToIpfs,
  uploadFileToIpfs,
  getProfileSettingsFromIpfs
} from "@/app/actions/pinata";

const { Title } = Typography;

const categoryArr = ["Personal", "Creator", "Business"];

export default function Profile({ params }) {
  const { handle } = use(params);

  const initialValues = {
    handle,
    category: "Personal" // Default to Personal
  };

  const initialAppearanceSettings = {
    ...DEFAULT_APPEARANCE_SETTINGS,
    banner: `https://picsum.photos/seed/${handle}/1200/200`
  };

  // State
  const [profile, setProfile] = useState(null);
  const [mode, setMode] = useState("view");
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState({
    read: false,
    write: false
  });
  const [aaWalletAddress, setAAWalletAddress] = useState(null);
  const [selectedSocials, setSelectedSocials] = useState([]);
  const [appearanceSettings, setAppearanceSettings] = useState(
    initialAppearanceSettings
  );
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const [profileFormData] = Form.useForm();
  const profileFormValues = Form.useWatch([], profileFormData);
  const [settingsFormData] = Form.useForm();

  const router = useRouter();
  const { address: account } = useAppKitAccount();
  const { selectedNetworkId } = useAppKitState();
  const { walletProvider } = useAppKitProvider("eip155");

  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");

  const isProfileOwner = useMemo(
    () =>
      aaWalletAddress &&
      profile?.owner?.toLowerCase() === aaWalletAddress?.toLowerCase(),
    [aaWalletAddress, profile]
  );

  // Effects
  useEffect(() => {
    fetchProfile();
    resolveAAWalletAddress();
  }, [account]);

  // On edit mode, preselect socials with existing links
  useEffect(() => {
    if (mode === "edit" && profile?.links) {
      setSelectedSocials(
        Object.keys(profile.links).filter((k) => profile.links[k])
      );
    }
  }, [mode, profile]);

  const resolveAAWalletAddress = async () => {
    if (!walletProvider) return;
    try {
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const aaWalletAddress = await getAAWalletAddress(signer);
      console.log(
        `Resolved AA Wallet Address for account ${account}: ${aaWalletAddress}`
      );
      setAAWalletAddress(aaWalletAddress?.toLowerCase());
    } catch (err) {
      console.error("Error resolving AA Wallet Address:", err);
    }
  };

  // Functions
  const fetchProfile = async () => {
    setLoading({ ...loading, read: true });
    try {
      const data = await client.request(GET_PROFILE_QUERY, {
        id: handle,
        notes_first: 100,
        notes_skip: 0,
        notes_orderBy: "createdAt",
        notes_orderDirection: "desc",
        notes_where: {},
        posts_first: 100,
        posts_skip: 0,
        posts_orderBy: "createdAt",
        posts_orderDirection: "desc",
        posts_where: {}
      });
      console.log("Fetched profile:", data);
      const profile = data?.profile;
      if (!profile && modeParam === "claim") setMode("edit");
      if (!profile) return;
      const { tokenId, linkKeys, links, ...profileObj } = profile;
      // parse links as key value pairs from arrays of keys and links
      const linksObj = {};
      linkKeys.forEach((key, i) => {
        linksObj[key] = links[i];
      });
      const parsedProfile = {
        ...profileObj,
        tokenId,
        links: linksObj,
        id: tokenId
      };
      console.log("parsed profile:", parsedProfile);
      setProfile(parsedProfile);
      profileFormData.setFieldsValue(parsedProfile);
      // get profile settings from IPFS if settingsHash is present
      if (parsedProfile?.settingsHash) {
        const profileSettingsRes = await getProfileSettingsFromIpfs(
          parsedProfile?.settingsHash
        );
        console.log("Fetched profile settings from IPFS:", profileSettingsRes);
        if (profileSettingsRes?.error) {
          return message.error(
            `Failed to fetch profile settings: ${profileSettingsRes?.error}`
          );
        }
        console.log("Parsed settings:", profileSettingsRes);
        setAppearanceSettings(profileSettingsRes);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      message.error("Failed to fetch profile. Please try again.");
    } finally {
      setLoading({ ...loading, read: false });
    }
  };

  const onFinish = async (dataObj) => {
    if (!account) return message.error("Please connect your wallet first");
    if (selectedNetworkId !== "eip155:689")
      return message.error("Please switch to NERO Testnet");
    const tokenId = profile?.id;
    setLoading({ ...loading, write: true });
    const categoryVal = categoryArr.indexOf(dataObj?.category);
    try {
      // upload settings to IPFS
      message.info("Uploading profile settings to IPFS...");
      const uploadRes = await uploadProfileSettingsToIpfs(appearanceSettings);
      if (uploadRes?.error) {
        return message.error(
          `Failed to upload profile settings: ${uploadRes?.error}`
        );
      }
      dataObj.settingsHash = uploadRes?.cid; // remove this line
      // if avatar file is present, upload it to IPFS
      if (avatarFile) {
        message.info("Uploading avatar to IPFS...");
        const formData = new FormData();
        formData.append("file", avatarFile?.originFileObj);
        const uploadRes = await uploadFileToIpfs(formData);
        if (uploadRes?.error) {
          console.error("Avatar upload failed:", uploadRes.error);
          return message.error(
            `Failed to upload avatar file: ${uploadRes?.error}`
          );
        }
        dataObj.avatar = `${PINATA_GATEWAY_URL}/ipfs/${uploadRes?.cid}`;
        console.log("Avatar uploaded to IPFS:", dataObj.avatar);
      } else {
        dataObj.avatar = profile?.avatar || "";
      }

      // clean & parse links as arrays of keys and links from key value pairs for contract function input
      // we need to remove empty or undefined links as form item make keys undefined if not filled and contract wont accept it
      const linksObj = dataObj.links || {}; // if no links selected, use empty object. sothat keys, links are empty arrays
      const cleanedLinksObj = Object.entries(linksObj).reduce(
        (acc, [key, value]) => {
          if (value) {
            acc[key] = value;
          }
          return acc;
        },
        {}
      );
      const linkKeys = Object.keys(cleanedLinksObj);
      const links = Object.values(cleanedLinksObj);
      // get signer
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      console.log("create/update data:", {
        ...dataObj,
        category: categoryVal,
        linkKeys,
        links
      });
      if (!tokenId) {
        const createOpTx = await executeOperation(
          signer,
          linkFolioContract.target,
          "createProfile",
          [
            dataObj.name,
            handle,
            categoryVal,
            dataObj.bio || "",
            dataObj.avatar || "",
            linkKeys,
            links,
            account,
            dataObj.settingsHash || "" // settingsHash is optional
          ]
        );
        console.log("Create Profile Tx:", createOpTx);
        message.success(
          "Profile created successfully. Redirecting in a few..."
        );
        // fetchProfile in 5 seconds to get the new profile
        setTimeout(() => {
          fetchProfile();
          setMode("view");
        }, 5000);
        return;
      }
      const updateOpTx = await executeOperation(
        signer,
        LINKFOLIO_CONTRACT_ADDRESS,
        "updateProfile",
        [
          tokenId,
          dataObj.name,
          categoryVal,
          dataObj.bio || "",
          dataObj.avatar || "",
          linkKeys,
          links,
          dataObj.settingsHash || "" // settingsHash is optional
        ]
      );
      console.log("Update Profile Tx:", updateOpTx);
      message.success(
        "Profile updated successfully. Redirecting to view mode in a few..."
      );
      // fetchProfile in 5 seconds to get the updated profile
      setTimeout(() => {
        fetchProfile();
        setMode("view");
      }, 5000);
    } catch (err) {
      console.error("Failed to create/update profile:", err);
      message.error(
        `Failed to create/update profile: ${
          err?.shortMessage || "Something went wrong!"
        }`
      );
    } finally {
      setLoading({ ...loading, write: false });
    }
  };

  const handleDeleteProfile = async () => {
    if (!profile?.id) return message.error("Profile not found");
    if (!account) return message.error("Please connect your wallet first");
    if (selectedNetworkId !== "eip155:689")
      return message.error("Please switch to Polygon Amoy Testnet");
    setLoading({ ...loading, write: true });
    try {
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const deleteOpTx = await executeOperation(
        signer,
        LINKFOLIO_CONTRACT_ADDRESS,
        "deleteProfile",
        [profile?.id]
      );
      console.log("Delete Profile Tx:", deleteOpTx);
      message.success("Profile deleted successfully!");
      router.push("/");
    } catch (err) {
      console.error("Error deleting profile:", err);
      message.error(
        `Failed to delete profile: ${
          err?.shortMessage || "Something went wrong!"
        }`
      );
    } finally {
      setLoading({ ...loading, write: false });
    }
  };
  return (
    <div>
      {mode === "edit" ? (
        <Row gutter={16}>
          {/* Left: Editing Section - Hide when preview is expanded */}
          {!isPreviewExpanded && (
            <Col xs={24} lg={12} xl={14}>
              <Card
                title={profile?.id ? "Edit Profile" : "Create Profile"}
                variant="outlined"
                loading={loading?.read}
                extra={
                  <Space>
                    <Button
                      type="primary"
                      shape="circle"
                      title="Save"
                      icon={<SaveOutlined />}
                      loading={loading?.write}
                      onClick={() => profileFormData.submit()}
                    />
                    {isProfileOwner && (
                      <Popconfirm
                        title="Are you sure you want to delete this profile?"
                        onConfirm={handleDeleteProfile}
                      >
                        <Button
                          title="Delete Profile"
                          type="primary"
                          shape="circle"
                          danger
                          icon={<DeleteOutlined />}
                        />
                      </Popconfirm>
                    )}
                  </Space>
                }
              >
                <Tabs
                  defaultActiveKey="profile"
                  tabPosition="top"
                  items={[
                    {
                      key: "profile",
                      label: "Profile",
                      children: (
                        <Form
                          form={profileFormData}
                          onFinish={onFinish}
                          initialValues={initialValues}
                          layout="vertical"
                          requiredMark
                        >
                          <Spin
                            spinning={loading?.write}
                            size="large"
                            tip="Transaction in progress..."
                            indicator={<LoadingOutlined spin />}
                          >
                            <Row gutter={16}>
                              <Col xs={24} lg={12}>
                                <Form.Item
                                  label="Avatar"
                                  name="avatar"
                                  hasFeedback
                                  help="Recommended 78x78, Max: 300KB"
                                >
                                  <Upload
                                    name="avatar"
                                    multiple={false}
                                    showUploadList
                                    listType="picture-circle"
                                    fileList={avatarFile ? [avatarFile] : []}
                                    accept="image/*"
                                    maxCount={1}
                                    beforeUpload={() => false}
                                    onChange={({ fileList }) => {
                                      console.log(
                                        "Avatar changed",
                                        fileList[0]
                                      );
                                      const file = fileList[0];
                                      if (!file) {
                                        setAvatarFile(null);
                                        return;
                                      }
                                      if (
                                        !file?.type?.startsWith("image/") ||
                                        file?.size > 300000
                                      ) {
                                        return message.error(
                                          "Invalid file type or size (Max 300KB)"
                                        );
                                      }
                                      setAvatarFile(file);
                                    }}
                                  >
                                    {avatarFile ? null : (
                                      <Avatar
                                        src={
                                          profile?.avatar ||
                                          `https://api.dicebear.com/5.x/open-peeps/svg?seed=${handle}`
                                        }
                                        alt="Profile"
                                        size={100}
                                        shape="circle"
                                      />
                                    )}
                                  </Upload>
                                </Form.Item>
                              </Col>
                              <Col xs={24} lg={12}>
                                <Form.Item
                                  label="Name"
                                  name="name"
                                  rules={[
                                    {
                                      required: true,
                                      message: "Please enter your name"
                                    }
                                  ]}
                                >
                                  <Input maxLength={50} showCount />
                                </Form.Item>
                                <Form.Item
                                  label="Handle"
                                  name="handle"
                                  hasFeedback
                                  help="Your unique handle, cannot be changed."
                                  rules={[
                                    {
                                      required: true,
                                      message: "Please enter your handle"
                                    }
                                  ]}
                                >
                                  <Input readOnly />
                                </Form.Item>
                                <Form.Item
                                  label="Category"
                                  name="category"
                                  rules={[
                                    {
                                      required: true,
                                      message: "Please select a category"
                                    }
                                  ]}
                                >
                                  <Select
                                    placeholder="Select profile category"
                                    options={[
                                      { label: "Personal", value: "Personal" },
                                      { label: "Creator", value: "Creator" },
                                      { label: "Business", value: "Business" }
                                    ]}
                                  />
                                </Form.Item>
                              </Col>
                            </Row>

                            <Row gutter={16}>
                              <Col xs={24} lg={24}>
                                <Form.Item label="Bio" name="bio">
                                  <Input.TextArea maxLength={300} showCount />
                                </Form.Item>
                              </Col>
                            </Row>

                            <Divider>
                              <Title level={5}>Social Links</Title>
                            </Divider>
                            <Typography.Paragraph
                              type="secondary"
                              style={{ marginBottom: "10px" }}
                            >
                              Select the social platforms to include links in
                              your profile. Click to add or remove them.
                            </Typography.Paragraph>
                            <Space wrap style={{ marginBottom: 16 }}>
                              {supportedSocials.map((social) => (
                                <Button
                                  key={social.id}
                                  size="small"
                                  type={
                                    selectedSocials.includes(
                                      social.name.toLowerCase()
                                    )
                                      ? "primary"
                                      : "default"
                                  }
                                  icon={social.icon || <GlobalOutlined />}
                                  onClick={() => {
                                    setSelectedSocials((prev) =>
                                      prev.includes(social.name.toLowerCase())
                                        ? prev.filter(
                                            (s) =>
                                              s !== social.name.toLowerCase()
                                          )
                                        : [...prev, social.name.toLowerCase()]
                                    );
                                  }}
                                >
                                  {social.name}
                                </Button>
                              ))}
                            </Space>

                            <Row gutter={16}>
                              {selectedSocials.map((socialKey) => {
                                const social = supportedSocials.find(
                                  (s) => s.name.toLowerCase() === socialKey
                                );
                                return (
                                  <Col xs={24} lg={12} key={socialKey}>
                                    <Form.Item
                                      label={social.name}
                                      name={["links", socialKey]}
                                      rules={[
                                        {
                                          required: true,
                                          message: `Please enter your ${social.name} profile link`
                                        }
                                      ]}
                                    >
                                      <Input
                                        addonBefore={
                                          social.icon || <GlobalOutlined />
                                        }
                                        placeholder={`Enter your ${social.name} profile link`}
                                        maxLength={100}
                                      />
                                    </Form.Item>
                                  </Col>
                                );
                              })}
                            </Row>

                            <Space>
                              <Button
                                shape="round"
                                onClick={() => setMode("view")}
                              >
                                Back
                              </Button>
                              <Button
                                type="primary"
                                shape="round"
                                htmlType="submit"
                                loading={loading?.write}
                              >
                                Save
                              </Button>
                            </Space>
                          </Spin>
                        </Form>
                      )
                    },
                    {
                      key: "appearance",
                      label: "Appearance",
                      children: (
                        <>
                          <Collapse
                            defaultActiveKey={["templates"]}
                            // activeKey={["templates"]}
                            // onChange={setTemplateCollapseActiveKey}
                            style={{ marginBottom: "16px" }}
                            expandIconPosition="end"
                            items={[
                              {
                                key: "templates",
                                label: (
                                  <Space direction="vertical">
                                    <Typography.Text strong>
                                      🎨 Quick Templates
                                    </Typography.Text>
                                    <Typography.Text type="secondary">
                                      Choose from our curated templates or
                                      customize your own style below.
                                    </Typography.Text>
                                  </Space>
                                ),
                                children: (
                                  <div
                                    style={{
                                      display: "grid",
                                      gridTemplateColumns:
                                        "repeat(auto-fit, minmax(200px, 1fr))",
                                      gap: "12px"
                                    }}
                                  >
                                    {profileTemplates.map((template) => (
                                      <Card
                                        key={template.id}
                                        size="small"
                                        hoverable
                                        onClick={() => {
                                          settingsFormData.setFieldsValue(
                                            template.settings
                                          );
                                          setAppearanceSettings(
                                            template.settings
                                          );
                                          message.success(
                                            `Applied ${template.name} template!`
                                          );
                                        }}
                                        style={{
                                          cursor: "pointer",
                                          border:
                                            appearanceSettings.fontFamily ===
                                              template.settings.fontFamily &&
                                            appearanceSettings.accentColor ===
                                              template.settings.accentColor
                                              ? "2px solid #1677ff"
                                              : "1px solid #d9d9d9",
                                          transition: "all 0.2s ease"
                                        }}
                                        styles={{
                                          body: { padding: "8px" }
                                        }}
                                      >
                                        <div
                                          style={{
                                            height: "60px",
                                            backgroundColor: "#f0f0f0", // Fallback color
                                            background:
                                              template.preview.background,
                                            borderRadius: "6px",
                                            marginBottom: "8px",
                                            position: "relative",
                                            overflow: "hidden",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            paddingLeft: "8px"
                                          }}
                                        >
                                          {/* Text Color and Style Indicator */}
                                          <div
                                            style={{
                                              fontSize: `${Math.max(
                                                14,
                                                template.settings.fontSize - 4
                                              )}px`,
                                              color:
                                                template.settings.textColor,
                                              fontFamily:
                                                template.settings.fontFamily,
                                              fontWeight:
                                                template.settings.linkStyle ===
                                                "bold"
                                                  ? "bold"
                                                  : "normal",
                                              textDecoration:
                                                template.settings.linkStyle ===
                                                "underline"
                                                  ? "underline"
                                                  : "none",
                                              textShadow:
                                                template.settings.textColor ===
                                                  "#FFFFFF" ||
                                                template.settings.textColor ===
                                                  "#F5F5F5"
                                                  ? "0 1px 2px rgba(0,0,0,0.5)"
                                                  : "none",
                                              letterSpacing: "0.5px"
                                            }}
                                          >
                                            T{template.settings.fontSize}
                                          </div>

                                          {/* Accent Color Button Indicator */}
                                          <div
                                            style={{
                                              position: "absolute",
                                              bottom: "4px",
                                              right: "4px",
                                              width: "20px",
                                              height: "20px",
                                              backgroundColor:
                                                template.settings.accentColor,
                                              borderRadius:
                                                template.settings
                                                  .buttonShape === "pill"
                                                  ? "50%"
                                                  : template.settings
                                                      .buttonShape === "square"
                                                  ? "2px"
                                                  : "4px",
                                              border:
                                                template.settings.cardStyle ===
                                                "bordered"
                                                  ? "1px solid #fff"
                                                  : "none",
                                              backdropFilter:
                                                template.settings.cardStyle ===
                                                "glass"
                                                  ? "blur(4px)"
                                                  : "none"
                                            }}
                                          />

                                          {/* Avatar Shape Indicator */}
                                          <div
                                            style={{
                                              position: "absolute",
                                              top: "4px",
                                              right: "4px",
                                              width: "12px",
                                              height: "12px",
                                              backgroundColor:
                                                template.settings.textColor,
                                              borderRadius:
                                                template.settings
                                                  .avatarShape === "circle"
                                                  ? "50%"
                                                  : template.settings
                                                      .avatarShape === "rounded"
                                                  ? "3px"
                                                  : "0px",
                                              opacity: 0.8
                                            }}
                                          />
                                        </div>
                                        <Typography.Text
                                          strong
                                          style={{
                                            fontSize: "12px",
                                            display: "block"
                                          }}
                                        >
                                          {template.name}
                                        </Typography.Text>
                                        <Typography.Text
                                          type="secondary"
                                          style={{ fontSize: "11px" }}
                                        >
                                          {template.description}
                                        </Typography.Text>
                                      </Card>
                                    ))}
                                  </div>
                                )
                              }
                            ]}
                          />
                          <Form
                            layout="vertical"
                            // id={JSON.stringify(appearanceSettings)} // force re-render on settings change
                            form={settingsFormData}
                            initialValues={initialAppearanceSettings}
                            onValuesChange={(changedValues, allValues) => {
                              console.log(
                                "Appearance settings changed:",
                                allValues
                              );
                              const colorFields = [
                                "accentColor",
                                "textColor",
                                "background"
                              ];
                              // Handle ColorPicker values which return objects
                              colorFields.forEach((field) => {
                                if (
                                  allValues[field] &&
                                  typeof allValues[field] === "object"
                                ) {
                                  allValues[field] =
                                    allValues[field].toHexString();
                                }
                              });
                              setAppearanceSettings(allValues);
                            }}
                          >
                            <Row gutter={16}>
                              <Col xs={24} lg={12}>
                                {/* Font Settings Row */}
                                <Row gutter={8}>
                                  <Col span={16}>
                                    <Form.Item
                                      label="Font Family"
                                      name="fontFamily"
                                    >
                                      <Select
                                        options={[
                                          {
                                            label: "Inter",
                                            value: "Inter, sans-serif"
                                          },
                                          {
                                            label: "Roboto",
                                            value: "Roboto, sans-serif"
                                          },
                                          {
                                            label: "Arial",
                                            value:
                                              "Arial, Helvetica, sans-serif"
                                          },
                                          {
                                            label: "Helvetica",
                                            value:
                                              "Helvetica, Arial, sans-serif"
                                          },
                                          {
                                            label: "Times New Roman",
                                            value:
                                              "'Times New Roman', Times, serif"
                                          },
                                          {
                                            label: "Courier New",
                                            value:
                                              "'Courier New', Courier, monospace"
                                          },
                                          {
                                            label: "Verdana",
                                            value: "Verdana, Geneva, sans-serif"
                                          },
                                          {
                                            label: "Georgia",
                                            value: "Georgia, serif"
                                          },
                                          {
                                            label: "Tahoma",
                                            value: "Tahoma, Geneva, sans-serif"
                                          },
                                          {
                                            label: "Trebuchet MS",
                                            value:
                                              "'Trebuchet MS', Helvetica, sans-serif"
                                          },
                                          {
                                            label: "System UI",
                                            value: "system-ui, sans-serif"
                                          }
                                        ]}
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col span={8}>
                                    <Form.Item
                                      label="Font Size"
                                      name="fontSize"
                                    >
                                      <InputNumber
                                        min={12}
                                        max={32}
                                        formatter={(value) => `${value}px`}
                                        parser={(value) =>
                                          value.replace("px", "")
                                        }
                                        // style={{ width: "100%" }}
                                      />
                                    </Form.Item>
                                  </Col>
                                </Row>
                                {/* Color Settings Row */}
                                <Row gutter={8}>
                                  <Col span={12}>
                                    <Form.Item
                                      label="Accent Color"
                                      name="accentColor"
                                    >
                                      <ColorPicker
                                        showText
                                        format="hex"
                                        presets={[
                                          {
                                            label: "Recommended",
                                            colors: [
                                              "#F5222D",
                                              "#FA8C16",
                                              "#FADB14",
                                              "#8BBB11",
                                              "#52C41A",
                                              "#13A8A8",
                                              "#1677FF",
                                              "#2F54EB",
                                              "#722ED1",
                                              "#EB2F96"
                                            ]
                                          }
                                        ]}
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col span={12}>
                                    <Form.Item
                                      label="Text Color"
                                      name="textColor"
                                    >
                                      <ColorPicker
                                        showText
                                        format="hex"
                                        presets={[
                                          {
                                            label: "Text Colors",
                                            colors: [
                                              "#000000",
                                              "#262626",
                                              "#434343",
                                              "#595959",
                                              "#8C8C8C",
                                              "#FFFFFF",
                                              "#F5F5F5",
                                              "#FAFAFA"
                                            ]
                                          }
                                        ]}
                                      />
                                    </Form.Item>
                                  </Col>
                                </Row>
                                <Form.Item label="Background" name="background">
                                  <ColorPicker
                                    showText
                                    format="hex" // Use CSS format for gradients
                                    allowClear
                                    mode={["single", "gradient"]}
                                    presets={[
                                      {
                                        label: "Solid Colors",
                                        colors: [
                                          "#FFFFFF",
                                          "#F5F5F5",
                                          "#E8F4FD",
                                          "#FFF7E6",
                                          "#F6FFED",
                                          "#F9F0FF"
                                        ]
                                      }
                                    ]}
                                  />
                                </Form.Item>
                              </Col>

                              <Col xs={24} lg={12}>
                                <Form.Item
                                  label="Banner Image URL"
                                  name="banner"
                                >
                                  <Input placeholder="Paste image URL or leave blank" />
                                </Form.Item>

                                {/* Card & Style Settings Row */}
                                <Row gutter={8}>
                                  <Col span={12}>
                                    <Form.Item
                                      label="Card Style"
                                      name="cardStyle"
                                    >
                                      <Select
                                        options={[
                                          {
                                            label: "Glassmorphic",
                                            value: "glass"
                                          },
                                          { label: "Solid", value: "solid" },
                                          {
                                            label: "Bordered",
                                            value: "bordered"
                                          }
                                        ]}
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col span={12}>
                                    <Form.Item
                                      label="Avatar Shape"
                                      name="avatarShape"
                                    >
                                      <Select
                                        options={[
                                          { label: "Circle", value: "circle" },
                                          {
                                            label: "Rounded",
                                            value: "rounded"
                                          },
                                          { label: "Square", value: "square" }
                                        ]}
                                      />
                                    </Form.Item>
                                  </Col>
                                </Row>

                                {/* Button & Link Settings Row */}
                                <Row gutter={8}>
                                  <Col span={12}>
                                    <Form.Item
                                      label="Button Shape"
                                      name="buttonShape"
                                    >
                                      <Select
                                        options={[
                                          { label: "Round", value: "round" },
                                          { label: "Pill", value: "pill" },
                                          { label: "Square", value: "square" }
                                        ]}
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col span={12}>
                                    <Form.Item
                                      label="Link Style"
                                      name="linkStyle"
                                    >
                                      <Select
                                        options={[
                                          { label: "Bold", value: "bold" },
                                          {
                                            label: "Underline",
                                            value: "underline"
                                          },
                                          {
                                            label: "Button",
                                            value: "button"
                                          },
                                          { label: "Normal", value: "normal" }
                                        ]}
                                      />
                                    </Form.Item>
                                  </Col>
                                </Row>
                              </Col>
                            </Row>
                          </Form>
                        </>
                      )
                    }
                  ]}
                />{" "}
              </Card>
            </Col>
          )}
          {/* Right: Live Preview Section - Expand to full width when editing section is hidden */}
          <Col
            xs={24}
            lg={isPreviewExpanded ? 24 : 8}
            xl={isPreviewExpanded ? 24 : 10}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}
          >
            <Card
              title={
                <>
                  Preview{" "}
                  <ExclamationCircleOutlined
                    title="May contain unsaved changes"
                    style={{
                      color: "#ff4d4f",
                      fontSize: "12px"
                      // fontWeight: "bold"
                    }}
                  />
                </>
              }
              hoverable
              style={{
                position: "sticky",
                top: "20px"
              }}
              extra={
                <Button
                  title={
                    isPreviewExpanded
                      ? "Collapse Preview"
                      : "Expand to Fullscreen"
                  }
                  shape="circle"
                  icon={
                    isPreviewExpanded ? (
                      <CompressOutlined />
                    ) : (
                      <ExpandAltOutlined />
                    )
                  }
                  onClick={() => {
                    if (!isPreviewExpanded) {
                      // Capture form values before expanding
                      const currentFormValues =
                        profileFormData.getFieldsValue();
                      setPreviewData(currentFormValues);
                    }
                    setIsPreviewExpanded(!isPreviewExpanded);
                  }}
                />
              }
            >
              <ProfileCard
                profile={{
                  ...profile,
                  ...(isPreviewExpanded ? previewData : profileFormValues),
                  links:
                    (isPreviewExpanded
                      ? previewData?.links
                      : profileFormValues?.links) || [], //priority to form values
                  avatar: avatarFile
                    ? URL.createObjectURL(avatarFile?.originFileObj)
                    : profile?.avatar ||
                      `https://api.dicebear.com/5.x/open-peeps/svg?seed=${handle}`
                }}
                aaWalletAddress={aaWalletAddress}
                appearanceSettings={appearanceSettings}
              />
            </Card>
          </Col>
        </Row>
      ) : (
        <>
          <Card
            variant="outlined"
            hoverable
            loading={loading?.read}
            actions={[
              <div
                key="powered-by"
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  color: "#999"
                }}
              >
                Powered by{" "}
                <a
                  href={window.location.origin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🔗 LinkFolio
                </a>
              </div>
            ]}
            extra={
              <Space>
                {isProfileOwner && (
                  <Button
                    title="Edit Profile"
                    shape="circle"
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => setMode("edit")}
                  />
                )}
                {profile?.id && (
                  <Space>
                    <Button
                      title="Refresh"
                      shape="circle"
                      icon={<SyncOutlined spin={loading?.read} />}
                      onClick={fetchProfile}
                    />
                    <Button
                      title="View on Explorer"
                      shape="circle"
                      icon={<ExportOutlined />}
                      href={`${EXPLORER_URL}/token/${LINKFOLIO_CONTRACT_ADDRESS}?a=${profile?.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                    <Button
                      title="Share Profile"
                      shape="circle"
                      icon={<ShareAltOutlined />}
                      onClick={() => {
                        if (navigator.share) {
                          navigator
                            .share({
                              title: `${profile?.name}'s LinkFolio`,
                              text: `Check out ${profile?.name}'s LinkFolio`,
                              url: window.location.href
                            })
                            .catch((error) =>
                              console.error("Failed to share profile", error)
                            );
                        } else {
                          console.warn("Web Share API not supported.");
                          navigator.clipboard.writeText(window.location.href);
                          message.success("Link copied to clipboard");
                        }
                      }}
                    />
                  </Space>
                )}
              </Space>
            }
          >
            {mode === "view" && !profile?.id ? (
              <>
                <h2>The page you are looking for does not exist.</h2>
                <h3>
                  Want this to be your handle?{" "}
                  <Button type="link" onClick={() => setMode("edit")}>
                    Create it now!
                  </Button>
                </h3>
              </>
            ) : (
              <ProfileCard
                profile={profile}
                aaWalletAddress={aaWalletAddress}
                appearanceSettings={appearanceSettings}
              />
            )}
          </Card>
          <Link
            href="/#get-started"
            style={{
              textAlign: "center",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Button type="link" icon={"🔗"} style={{ marginTop: "20px" }}>
              Create Your LinkFolio
              <ArrowRightOutlined />
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}
