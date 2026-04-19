import { useState, useEffect } from "react";
import {
  useNavigate,
  useParams,
  useSearch,
  Link
} from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Form,
  Input,
  Button,
  Upload,
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
  Result,
  ColorPicker,
  InputNumber,
  Collapse,
  Tag,
  Skeleton,
  App as AntdApp
} from "antd";
import {
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
  CompressOutlined,
  ArrowLeftOutlined,
  RollbackOutlined,
  XOutlined,
  FacebookOutlined,
  YoutubeOutlined,
  GithubOutlined,
  GlobalOutlined,
  DiscordOutlined,
  FrownOutlined,
  CodeOutlined,
  LinkedinOutlined,
  InstagramOutlined
} from "@ant-design/icons";
import {
  useAppKitProvider,
  useAppKitAccount,
  useAppKitState
} from "@reown/appkit/react";
import { BrowserProvider } from "ethers";
import ProfileCard from "@/components/ProfileCard";
import {
  linkFolioContract,
  subgraphClient as client,
  GET_PROFILE_QUERY,
  DEFAULT_APPEARANCE_SETTINGS
} from "@/utils";
import { profileTemplates } from "@/utils/profileTemplates";
import {
  EXPLORER_URL,
  LINKFOLIO_CONTRACT_ADDRESS,
  PINATA_GATEWAY_URL
} from "@/utils/constants";
import {
  uploadProfileSettingsToIpfs,
  uploadFileToIpfs,
  getProfileSettingsFromIpfs
} from "@/lib/functions/pinata";

const { Title } = Typography;

const categoryArr = ["Personal", "Creator", "Business"];

// Font family options for the appearance settings
const fontFamilies = [
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Roboto", value: "Roboto, sans-serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Poppins", value: "Poppins, sans-serif" },
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Courier New", value: "'Courier New', Courier, monospace" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Cursive", value: "cursive" },
  { label: "Tahoma", value: "Tahoma, Geneva, sans-serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', Helvetica, sans-serif" },
  { label: "System UI", value: "system-ui, sans-serif" }
];

const supportedSocials = [
  { id: "facebook", name: "Facebook", icon: <FacebookOutlined /> },
  { id: "youtube", name: "YouTube", icon: <YoutubeOutlined /> },
  { id: "github", name: "GitHub", icon: <GithubOutlined /> },
  { id: "snapchat", name: "Snapchat", icon: <GlobalOutlined /> },
  { id: "telegram", name: "Telegram", icon: <GlobalOutlined /> },
  { id: "discord", name: "Discord", icon: <DiscordOutlined /> },
  { id: "farcaster", name: "Farcaster", icon: <FrownOutlined /> },
  { id: "blockchain", name: "Blockchain", icon: <CodeOutlined /> },
  { id: "linkedin", name: "LinkedIn", icon: <LinkedinOutlined /> },
  { id: "x", name: "X", icon: <XOutlined /> },
  { id: "instagram", name: "Instagram", icon: <InstagramOutlined /> },
  { id: "other", name: "Other", icon: <GlobalOutlined /> }
];

export default function Profile() {
  const { handle } = useParams({ strict: false });
  const { message } = AntdApp.useApp();
  const getProfileSettingsFromIpfsFn = useServerFn(getProfileSettingsFromIpfs);
  const uploadProfileSettingsToIpfsFn = useServerFn(
    uploadProfileSettingsToIpfs
  );
  const uploadFileToIpfsFn = useServerFn(uploadFileToIpfs);

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
  const [selectedSocials, setSelectedSocials] = useState([]);
  const [appearanceSettings, setAppearanceSettings] = useState(
    initialAppearanceSettings
  );
  const [savedAppearanceSettings, setSavedAppearanceSettings] = useState(
    initialAppearanceSettings
  );
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const [profileFormData] = Form.useForm();
  const profileFormValues = Form.useWatch([], profileFormData);
  const [settingsFormData] = Form.useForm();

  const navigate = useNavigate();
  const { address: account } = useAppKitAccount();
  const { selectedNetworkId } = useAppKitState();
  const { walletProvider } = useAppKitProvider("eip155");

  const search = useSearch({ strict: false });
  const modeParam = search?.mode;

  const hasProfile = Boolean(profile?.id);
  const isProfileOwner =
    hasProfile && profile?.owner?.id === account?.toLowerCase();
  const isLoadingProfile = loading?.read;
  const isEditMode = mode === "edit";
  const showProfileNotFound = !isLoadingProfile && !hasProfile && !isEditMode;
  const previewProfile = isEditMode
    ? {
        ...profile,
        ...(isPreviewExpanded ? previewData : profileFormValues),
        links:
          (isPreviewExpanded ? previewData?.links : profileFormValues?.links) ||
          [],
        avatar: avatarFile
          ? URL.createObjectURL(avatarFile?.originFileObj)
          : profile?.avatar ||
            `https://api.dicebear.com/5.x/open-peeps/svg?seed=${handle}`
      }
    : null;

  // Effects
  useEffect(() => {
    fetchProfile();
  }, [account]);

  // On edit mode, preselect socials with existing links
  useEffect(() => {
    if (mode === "edit" && profile?.links) {
      setSelectedSocials(
        Object.keys(profile.links).filter((k) => profile.links[k])
      );
    }
  }, [mode, profile]);

  // Warn about unsaved changes on reload, back button, or tab close
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (mode === "edit") {
        event.preventDefault();
        event.returnValue =
          "You may have unsaved changes. Are you sure you want to leave?";
        return "You may have unsaved changes. Are you sure you want to leave?";
      }
    };

    const handlePopState = (event) => {
      if (mode === "edit") {
        const confirmLeave = window.confirm(
          "You may have unsaved changes. Are you sure you want to leave?"
        );
        if (!confirmLeave) {
          // Push the current state back to prevent navigation
          window.history.pushState(null, "", window.location.href);
        }
      }
    };

    if (mode === "edit") {
      window.addEventListener("beforeunload", handleBeforeUnload);
      window.addEventListener("popstate", handlePopState);
      // Push a state to handle back button
      window.history.pushState(null, "", window.location.href);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [mode]);

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
      setProfile(parsedProfile);
      profileFormData.setFieldsValue(parsedProfile);
      // get profile settings from IPFS if settingsHash is present
      if (parsedProfile?.settingsHash) {
        const profileSettingsRes = await getProfileSettingsFromIpfsFn({
          data: parsedProfile?.settingsHash
        });
        if (profileSettingsRes?.error) {
          return message.error(
            `Failed to fetch profile settings: ${profileSettingsRes?.error}`
          );
        }
        settingsFormData.setFieldsValue(profileSettingsRes);
        setAppearanceSettings(profileSettingsRes);
        setSavedAppearanceSettings(profileSettingsRes);
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
    if (selectedNetworkId !== "eip155:80002")
      return message.error("Please switch to Polygon Amoy network");
    const tokenId = profile?.id;
    setLoading({ ...loading, write: true });
    const categoryVal = categoryArr.indexOf(dataObj?.category);
    try {
      // upload settings to IPFS
      message.info("Uploading profile settings to IPFS...");
      const uploadRes = await uploadProfileSettingsToIpfsFn({
        data: appearanceSettings
      });
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
        const uploadRes = await uploadFileToIpfsFn({ data: formData });
        if (uploadRes?.error) {
          console.error("Avatar upload failed:", uploadRes.error);
          return message.error(
            `Failed to upload avatar file: ${uploadRes?.error}`
          );
        }
        dataObj.avatar = `${PINATA_GATEWAY_URL}/ipfs/${uploadRes?.cid}`;
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
        const createTx = await linkFolioContract
          .connect(signer)
          .createProfile(
            dataObj.name,
            handle,
            categoryVal,
            dataObj.bio || "",
            dataObj.avatar || "",
            linkKeys,
            links,
            dataObj.settingsHash || ""
          );
        console.log("Create Profile Tx:", createTx);
        await createTx.wait();
        message.success(
          "Profile created successfully. Redirecting in 5 seconds..."
        );
        // fetchProfile in 5 seconds to get the new profile
        setTimeout(() => {
          fetchProfile();
          setMode("view");
        }, 5000);
        return;
      }
      const updateTx = await linkFolioContract
        .connect(signer)
        .updateProfile(
          tokenId,
          dataObj.name,
          categoryVal,
          dataObj.bio || "",
          dataObj.avatar || "",
          linkKeys,
          links,
          dataObj.settingsHash || ""
        );
      console.log("Update Profile Tx:", updateTx);
      await updateTx.wait();
      message.success(
        "Profile updated successfully. Redirecting to view mode in 5 seconds..."
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
    if (!hasProfile) return message.error("Profile not found");
    if (!account) return message.error("Please connect your wallet first");
    if (selectedNetworkId !== "eip155:80002")
      return message.error("Please switch to Polygon Amoy network");
    setLoading({ ...loading, write: true });
    try {
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const deleteTx = await linkFolioContract
        .connect(signer)
        .deleteProfile(profile?.id);
      console.log("Delete Profile Tx:", deleteTx);
      await deleteTx.wait();
      message.success("Profile deleted successfully!");
      navigate({ to: "/" });
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

  if (isLoadingProfile) {
    return (
      <Card
        variant="outlined"
        cover={
          <Skeleton.Node
            style={{
              width: "100%",
              height: 120,
              borderRadius: "12px 12px 0 0"
            }}
            active
          />
        }
        actions={[
          <Skeleton.Button
            shape="round"
            active
            size="small"
            style={{ width: 180 }}
          />
        ]}
        extra={
          <Skeleton.Button
            key="1"
            shape="round"
            active
            size="small"
            style={{ width: 180 }}
          />
        }
        styles={{
          root: { padding: 0 }
        }}
      >
        <Space orientation="vertical" align="center" style={{ width: "100%" }}>
          <Skeleton.Avatar active size={88} shape="circle" />

          <Skeleton.Button
            shape="round"
            active
            size="small"
            style={{ width: 180 }}
          />
          <Skeleton.Button
            shape="round"
            active
            size="small"
            style={{ width: 120 }}
          />
          <Skeleton.Button
            shape="round"
            active
            size="small"
            style={{ width: 180 }}
          />

          <Space style={{ width: "100%" }}>
            <Skeleton.Button
              shape="round"
              active
              size="small"
              style={{ width: 5 }}
            />
            <Skeleton.Button
              shape="round"
              active
              size="small"
              style={{ width: 40 }}
            />
            <Skeleton.Button
              shape="round"
              active
              size="small"
              style={{ width: 80 }}
            />
            <Skeleton.Button
              shape="round"
              active
              size="small"
              style={{ width: 160 }}
            />
          </Space>
          <Skeleton active paragraph={{ rows: 8 }} title round />
        </Space>
      </Card>
    );
  }

  if (showProfileNotFound) {
    return (
      <Result
        status="404"
        title={`@${handle} not found`}
        subTitle="The page you are looking for does not exist. Want this to be your handle? 
 you can create it now."
        extra={[
          <Button key="create" type="primary" onClick={() => setMode("edit")}>
            Create Profile
          </Button>,
          <Link key="home" to="/#how-it-works">
            <Button>See How It Works</Button>
          </Link>
        ]}
      />
    );
  }

  return (
    <div>
      {isEditMode ? (
        <Row gutter={16}>
          {/* Left: Editing Section - Hide when preview is expanded */}
          {!isPreviewExpanded && (
            <Col xs={24} lg={12} xl={14}>
              <Card
                title={hasProfile ? "Edit Profile" : "Create Profile"}
                variant="outlined"
                style={{
                  marginBottom: "10px"
                }}
                extra={
                  <Space>
                    {hasProfile && (
                      <Button
                        shape="circle"
                        title="Back"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => {
                          const confirmLeave = window.confirm(
                            "You may have unsaved changes. Are you sure you want to go back?"
                          );
                          if (confirmLeave) {
                            fetchProfile(); // fetch profile again to ensure accurate data and settings
                            setMode("view");
                          }
                        }}
                      />
                    )}
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
                  tabPlacement="top"
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
                            description="Transaction in progress..."
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
                                  shape="round"
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
                                        prefix={
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
                                onClick={() => {
                                  const confirmLeave = window.confirm(
                                    "You may have unsaved changes. Are you sure you want to go back?"
                                  );
                                  if (confirmLeave) {
                                    fetchProfile(); // fetch profile again to ensure accurate data and settings
                                    setMode("view");
                                  }
                                }}
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
                      label: (
                        <Typography.Text strong>
                          Appearance{" "}
                          <Tag
                            color="success"
                            style={{
                              fontSize: "9px"
                            }}
                          >
                            New
                          </Tag>
                        </Typography.Text>
                      ),
                      children: (
                        <>
                          <Collapse
                            // defaultActiveKey={["templates"]}
                            // activeKey={["templates"]}
                            // onChange={setTemplateCollapseActiveKey}
                            style={{ marginBottom: "16px" }}
                            expandIconPlacement="end"
                            items={[
                              {
                                key: "templates",
                                label: (
                                  <Space orientation="vertical">
                                    <Typography.Text strong>
                                      🎨 Quick Templates{" "}
                                      <Tag
                                        color="success"
                                        style={{
                                          fontSize: "9px"
                                        }}
                                      >
                                        New
                                      </Tag>
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
                                              template.settings.background,
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
                                                        .buttonShape ===
                                                      "square"
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
                                                        .avatarShape ===
                                                      "rounded"
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
                            form={settingsFormData}
                            initialValues={initialAppearanceSettings}
                            style={{ display: "flex", flexDirection: "column" }}
                            onValuesChange={(changedValues, allValues) => {
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
                            <Button
                              type="text"
                              icon={<RollbackOutlined />}
                              title={
                                profile?.settingsHash
                                  ? "Reset appearance to your last saved settings"
                                  : "Reset appearance to default theme settings"
                              }
                              style={{
                                alignSelf: "flex-end"
                              }}
                              onClick={() => {
                                settingsFormData.setFieldsValue(
                                  savedAppearanceSettings
                                );
                                setAppearanceSettings(savedAppearanceSettings);
                                message.success(
                                  profile?.settingsHash
                                    ? "Reset to saved settings!"
                                    : "Reset to default settings!"
                                );
                              }}
                            />
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
                                        options={fontFamilies.map((font) => ({
                                          label: (
                                            <span
                                              style={{ fontFamily: font.value }}
                                            >
                                              {font.label}
                                            </span>
                                          ),
                                          value: font.value
                                        }))}
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
                                        allowClear
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
                                        allowClear
                                        format="hex"
                                        presets={[
                                          {
                                            label: "Recommended",
                                            colors: [
                                              "#000000",
                                              "#2c3e50",
                                              "#4a4a4a",
                                              "#5d5d5d",
                                              "#1a202c",
                                              "#2b6cb0",
                                              "#4c51bf",
                                              "#553c9a",
                                              "#744210",
                                              "#975a16",
                                              "#c53030",
                                              "#ffffff"
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
                />
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
                overflow: "hidden"
              }}
              styles={{
                body: {
                  padding: 0
                }
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
                profile={previewProfile}
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
            style={{
              overflow: "hidden"
            }}
            styles={{
              body: {
                padding: 0
              }
            }}
            extra={
              <Space wrap>
                {isProfileOwner && (
                  <Button
                    type="text"
                    title="Edit Profile"
                    shape="circle"
                    icon={<EditOutlined />}
                    onClick={() => setMode("edit")}
                  />
                )}
                {hasProfile && (
                  <Space>
                    <Button
                      type="text"
                      title="Refresh"
                      shape="circle"
                      icon={<SyncOutlined spin={loading?.read} />}
                      onClick={fetchProfile}
                    />
                    <Button
                      type="text"
                      title="View on Explorer"
                      shape="circle"
                      icon={<ExportOutlined />}
                      href={`${EXPLORER_URL}/nft/${LINKFOLIO_CONTRACT_ADDRESS}/${profile?.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                    <Button
                      type="text"
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
            <ProfileCard
              profile={profile}
              appearanceSettings={appearanceSettings}
            />
          </Card>
          <Link
            to="/#get-started"
            style={{
              textAlign: "center",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Button
              type="link"
              style={{
                marginTop: "20px"
              }}
            >
              🔗 Create Your LinkFolio
              <ArrowRightOutlined />
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}
