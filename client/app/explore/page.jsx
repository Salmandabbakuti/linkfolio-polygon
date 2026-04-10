"use client";
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
import Link from "next/link";
import { useAppKitAccount } from "@reown/appkit/react";
import { subgraphClient as client, GET_PROFILES_QUERY } from "@/app/utils";
import { SyncOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;
const { Search } = Input;

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
            loading={dataLoading}
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
          {profiles.length === 0 && !dataLoading ? (
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
          ) : (
            profiles.map((item) => (
              <Col xs={24} sm={12} md={8} lg={6} key={item.handle}>
                <Link href={`/${item?.handle}`} key="view-profile">
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
                    <Tag
                      variant="outlined"
                      color={
                        item?.category === "Personal"
                          ? "magenta"
                          : item?.category === "Business"
                            ? "blue"
                            : item?.category === "Creator"
                              ? "green"
                              : "default"
                      }
                    >
                      {item?.category}
                    </Tag>
                  </Card>
                </Link>
              </Col>
            ))
          )}
        </Row>
      </div>
    </div>
  );
}
