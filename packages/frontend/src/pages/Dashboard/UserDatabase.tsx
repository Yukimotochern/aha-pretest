import { useEffect, useState } from 'react';
import { Col, Row, Statistic, Table } from 'antd';
import dayjs from 'dayjs';
import { trpc } from '../../trpc/client';
import { apiErrorMsg } from '../../utils/message';
import { ColumnsType } from 'antd/es/table';

type Data = Awaited<ReturnType<typeof trpc.user.getUserStatistics.query>>;

const renderDate = (value: Date) => dayjs(value).format();

const columns: ColumnsType<Data['userData'][number]> = [
  {
    title: 'Sign Up Time',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: renderDate,
  },
  {
    title: 'Login Times',
    dataIndex: 'loginTimes',
    key: 'loginTimes',
  },
  {
    title: 'Last User Session Timestamp',
    dataIndex: 'lastSession',
    key: 'lastSession',
    render: renderDate,
  },
];

export const UserDatabase = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Data>({
    statistics: {
      numOfUser: 0,
      activeUserToday: 0,
      avgSessionUsersLastSevenDays: 0,
    },
    userData: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await trpc.user.getUserStatistics.query({
          utcOffset: (-1 * new Date().getTimezoneOffset()) / 60,
        });
        setData(data);
      } catch (err) {
        apiErrorMsg();
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <Row gutter={16}>
        <Col span={12}>
          <Statistic
            title="Number of Users"
            value={data.statistics.numOfUser}
            loading={loading}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Active Users Today"
            value={data.statistics.activeUserToday}
            loading={loading}
          />
        </Col>
        <Col span={24} className="mt-3">
          <Statistic
            title={`Average Session Users in Last 7 Days (${dayjs()
              .subtract(7, 'day')
              .format('MM/DD')}~${dayjs().subtract(1, 'day').format('MM/DD')})`}
            value={data.statistics.avgSessionUsersLastSevenDays.toLocaleString()}
            loading={loading}
          />
        </Col>
      </Row>
      <Table
        className="mt-5"
        dataSource={data.userData}
        columns={columns}
        pagination={false}
      />
    </div>
  );
};
