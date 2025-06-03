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
  Select
} from "antd";
import {
  GlobalOutlined,
  EyeOutlined,
  DeleteOutlined,
  EditOutlined,
  ShareAltOutlined,
  ArrowRightOutlined,
  ExportOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  LoadingOutlined
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
  GET_PROFILE_QUERY
} from "@/app/utils";
import { LINKFOLIO_CONTRACT_ADDRESS } from "@/app/utils/constants";
import { executeOperation, getAAWalletAddress } from "@/app/utils/aaUtils";

const { Title, Text } = Typography;

const categoryArr = ["Personal", "Creator", "Business"];

export default function Profile({ params }) {
  // State
  const [profile, setProfile] = useState(null);
  const [formData] = Form.useForm();
  const [mode, setMode] = useState("view");
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState({
    read: false,
    write: false
  });
  const [aaWalletAddress, setAAWalletAddress] = useState(null);
  const [selectedSocials, setSelectedSocials] = useState([]);

  const { handle } = use(params);
  const router = useRouter();
  const { address: account } = useAppKitAccount();
  const { selectedNetworkId } = useAppKitState();
  const { walletProvider } = useAppKitProvider("eip155");

  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");

  const initialValues = {
    name: "",
    handle,
    category: "Personal", // Default to Personal
    bio: "",
    avatar: "",
    links: {}
  };

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
  }, [walletProvider]);

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
      setAAWalletAddress(aaWalletAddress);
    } catch (err) {
      console.error("Error resolving AA Wallet Address:", err);
    }
  };

  // Functions
  const fetchProfile = async () => {
    setLoading({ ...loading, read: true });
    client
      .request(GET_PROFILE_QUERY, {
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
      })
      .then((data) => {
        console.log("Fetched profile:", data);
        const profile = data?.profile;
        if (!profile && modeParam === "claim") setMode("edit");
        if (!profile) return;
        const { tokenId, linkKeys, links, owner, ...profileObj } = profile;
        // parse links as key value pairs from arrays of keys and links
        const linksObj = {};
        linkKeys.forEach((key, i) => {
          linksObj[key] = links[i];
        });
        const parsedProfile = {
          ...profileObj,
          tokenId,
          links: linksObj,
          id: tokenId,
          owner: owner?.id
        };
        console.log("parsed profile:", parsedProfile);
        setProfile(parsedProfile);
        formData.setFieldsValue(parsedProfile);
      })
      .catch((err) => {
        console.error("Failed to fetch profile:", err);
        message.error("Failed to fetch profile. Please try again.");
      })
      .finally(() => setLoading({ ...loading, read: false }));
  };

  const onFinish = async (dataObj) => {
    if (!account) return message.error("Please connect your wallet first");
    if (selectedNetworkId !== "eip155:689")
      return message.error("Please switch to NERO Testnet");
    const tokenId = profile?.id;
    setLoading({ ...loading, write: true });
    const categoryVal = categoryArr.indexOf(dataObj?.category);
    try {
      // if avatar file is present, upload it to IPFS
      if (avatarFile) {
        message.info("Avatar upload is coming soon!");
        dataObj.avatar = profile?.avatar || ""; // remove this line
        // const ipfsHash = await uploadImageToIpfs(avatarFile);
        // dataObj.avatar = ipfsHash;
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
            dataObj.bio,
            dataObj.avatar,
            linkKeys,
            links,
            account
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
          dataObj.bio,
          dataObj.avatar,
          linkKeys,
          links
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
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      {mode === "edit" ? (
        <Tabs
          defaultActiveKey="profile"
          // tabPosition="left"
          animated
          // centered
          items={[
            {
              key: "profile",
              label: "Profile",
              children: (
                <Card
                  title={profile?.id ? "Edit Profile" : "Create Profile"}
                  variant="outlined"
                  loading={loading?.read}
                  extra={
                    <Space>
                      <Button
                        title="Preview"
                        shape="circle"
                        icon={<EyeOutlined />}
                        onClick={() => setMode("preview")}
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
                  <Form
                    form={formData}
                    onFinish={onFinish}
                    initialValues={initialValues}
                    layout="vertical"
                    // size="large"
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
                                console.log("Avatar changed", fileList[0]);
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
                            <Input />
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
                            <Input.TextArea />
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
                        Select the social platforms to include links in your
                        profile. Click to add or remove them.
                      </Typography.Paragraph>
                      <Row gutter={16} style={{ marginBottom: 16 }}>
                        <Col span={24}>
                          <Space wrap>
                            {supportedSocials.map((social) => (
                              <Button
                                key={social.id}
                                type={
                                  selectedSocials.includes(
                                    social.name.toLowerCase()
                                  )
                                    ? "primary"
                                    : "default"
                                }
                                icon={social.icon || <GlobalOutlined />}
                                shape="round"
                                onClick={() => {
                                  setSelectedSocials((prev) =>
                                    prev.includes(social.name.toLowerCase())
                                      ? prev.filter(
                                          (s) => s !== social.name.toLowerCase()
                                        )
                                      : [...prev, social.name.toLowerCase()]
                                  );
                                }}
                              >
                                {social.name}
                              </Button>
                            ))}
                          </Space>
                        </Col>
                      </Row>
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
                                />
                              </Form.Item>
                            </Col>
                          );
                        })}
                      </Row>

                      <Space>
                        <Button shape="round" onClick={() => setMode("view")}>
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
                </Card>
              )
            },
            {
              key: "Appearance",
              label: "Appearance",
              children: (
                <Card title="Coming Soon" variant="outlined">
                  <Text type="secondary">
                    We are working on custom themes and appearance settings.
                    Stay tuned!
                  </Text>
                </Card>
              )
            }
          ]}
        />
      ) : (
        <>
          <Card
            title={
              mode === "preview" ? (
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
              ) : null
            }
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
                {(isProfileOwner || mode === "preview") && (
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
                      href={`https://testnet.neroscan.io/token/${LINKFOLIO_CONTRACT_ADDRESS}?a=${profile?.id}`}
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
                aaWalletAddress={aaWalletAddress}
                profile={
                  mode === "preview"
                    ? {
                        ...profile,
                        ...formData.getFieldsValue()
                      }
                    : profile
                }
              />
            )}
          </Card>
          <Link
            href="/"
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
