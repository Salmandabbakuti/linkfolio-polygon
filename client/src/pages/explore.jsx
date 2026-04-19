import { useState, useEffect } from "react";
import {
  Typography,
  Input,
  Button,
  Space,
  Row,
  Col,
  Select,
  Card,
  Avatar,
  Empty,
  Tag,
  App as AntdApp
} from "antd";
import { Link } from "@tanstack/react-router";
import { useAppKitAccount } from "@reown/appkit/react";
import { subgraphClient as client, GET_PROFILES_QUERY } from "@/utils";
import { SyncOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;
const { Search } = Input;
const SKELETON_COUNT = 8;

const getCategoryColor = (category) => {
  switch (category) {
    case "Personal":
      return "cyan";
    case "Business":
      return "blue";
    case "Creator":
      return "green";
    default:
      return "default";
  }
};

export default function Explore() {
  const [dataLoading, setDataLoading] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [showMyProfiles, setShowMyProfiles] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { address: account } = useAppKitAccount();
  const { message } = AntdApp.useApp();

  const fetchProfiles = () => {
    setDataLoading(true);
    client
      .request(GET_PROFILES_QUERY, {
        first: 30,
        skip: 0,
        orderBy: "createdAt",
        orderDirection: "desc",
        where: {
          and: [
            { owner: showMyProfiles ? account?.toLowerCase() : undefined },
            ...(searchQuery
              ? [
                  {
                    or: [
                      {
                        name_contains_nocase: searchQuery
                      },
                      {
                        handle_contains_nocase: searchQuery
                      },
                      {
                        bio_contains_nocase: searchQuery
                      },
                      {
                        category_contains_nocase: searchQuery
                      },
                      { owner_contains_nocase: searchQuery }
                    ]
                  }
                ]
              : [])
          ]
        }
      })
      .then((data) => {
        setProfiles(data?.profiles || []);
      })
      .catch((err) => {
        console.error("Error fetching profiles:", err);
        message.error(
          err?.message || "Failed to fetch profiles. Please try again!"
        );
      })
      .finally(() => {
        setDataLoading(false);
      });
  };

  useEffect(() => {
    fetchProfiles();
  }, [showMyProfiles, account]);

  const isEmptyState = !dataLoading && profiles.length === 0;
  const hasProfiles = !dataLoading && profiles.length > 0;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: 20 }}>
        Discover
      </Title>
      <Paragraph type="secondary" style={{ textAlign: "center" }}>
        Explore amazing profiles from our community
      </Paragraph>
      <div style={{ maxWidth: 600, margin: "0 auto 32px auto" }}>
        <Space wrap>
          <Search
            size="large"
            allowClear
            placeholder="Search by name, handle, or bio"
            onSearch={fetchProfiles}
            onPressEnter={fetchProfiles}
            enterButton
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            size="large"
            defaultValue={false}
            onChange={(value) => {
              setShowMyProfiles(value);
            }}
            style={{ minWidth: 120 }}
            options={[
              { value: false, label: "By All" },
              { value: true, label: "By Me", disabled: !account }
            ]}
          />
          <Button
            shape="circle"
            icon={<SyncOutlined spin={dataLoading} />}
            onClick={fetchProfiles}
          />
        </Space>
      </div>
      <div style={{ marginTop: 32 }}>
        <Row gutter={[24, 24]} justify="start">
          {dataLoading &&
            Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <Col xs={24} sm={12} md={8} lg={6} key={index}>
                <Card
                  cover={<div style={{ height: 100 }} />}
                  hoverable
                  style={{ height: 270 }}
                  variant="outlined"
                  loading
                />
              </Col>
            ))}
          {isEmptyState && (
            <Col span={24} style={{ textAlign: "center", marginTop: 60 }}>
              <Empty
                description={
                  <>
                    <Title level={5} type="secondary">
                      No profiles found
                    </Title>
                    <Paragraph type="secondary">
                      Try searching with different keywords or check back later.
                    </Paragraph>
                  </>
                }
              />
            </Col>
          )}
          {hasProfiles &&
            profiles.map((item) => (
              <Col xs={24} sm={12} md={8} lg={6} key={item.handle}>
                <Link
                  to="/$handle"
                  params={{ handle: item?.handle }}
                  key="view-profile"
                >
                  <Card
                    hoverable
                    variant="outlined"
                    style={{
                      borderRadius: 16,
                      textAlign: "center"
                    }}
                  >
                    <Avatar
                      src={
                        item?.avatar ||
                        `https://api.dicebear.com/5.x/open-peeps/svg?seed=${item?.handle}`
                      }
                      alt="avatar"
                      size={80}
                      shape="circle"
                      style={{ border: "1px solid grey", marginBottom: 16 }}
                    />
                    <Title level={4} style={{ marginBottom: 4 }}>
                      {item?.name}
                    </Title>
                    <Paragraph type="secondary" style={{ marginBottom: 8 }}>
                      @{item?.handle}
                    </Paragraph>
                    <Paragraph ellipsis={{ rows: 1 }} style={{ color: "#666" }}>
                      {item?.bio || "No bio available"}
                    </Paragraph>
                    <Space size="small">
                      <Tag>#{item?.tokenId}</Tag>
                      <Tag
                        variant="outlined"
                        color={getCategoryColor(item?.category)}
                      >
                        {item?.category}
                      </Tag>
                    </Space>
                  </Card>
                </Link>
              </Col>
            ))}
        </Row>
      </div>
    </div>
  );
}
