import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Tabs,
  Tab,
  LinearProgress,
  Avatar,
  Badge,
  Checkbox,
  TablePagination,
  Tooltip as MuiTooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalStartups: number;
  totalJobs: number;
  totalFunding: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  recentActivity: any[];
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: 'active' | 'suspended' | 'pending';
  createdAt: string;
  lastLogin: string;
}

interface Startup {
  id: string;
  name: string;
  industry: string;
  stage: string;
  status: 'active' | 'pending' | 'suspended';
  founderId: string;
  createdAt: string;
}

interface Job {
  id: string;
  title: string;
  company: string;
  status: 'active' | 'closed' | 'pending';
  applications: number;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Search states
  const [startupSearch, setStartupSearch] = useState('');
  const [jobSearch, setJobSearch] = useState('');

  // Pagination states
  const [usersPage, setUsersPage] = useState(0);
  const [usersRowsPerPage, setUsersRowsPerPage] = useState(5);
  const [startupsPage, setStartupsPage] = useState(0);
  const [startupsRowsPerPage, setStartupsRowsPerPage] = useState(5);
  const [jobsPage, setJobsPage] = useState(0);
  const [jobsRowsPerPage, setJobsRowsPerPage] = useState(5);

  // Selection states
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedStartupIds, setSelectedStartupIds] = useState<string[]>([]);
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);

  // Selection handlers
  const handleSelectAllClick = (
    event: React.ChangeEvent<HTMLInputElement>,
    items: any[],
    setSelected: (ids: string[]) => void
  ) => {
    if (event.target.checked) {
      const newSelecteds = items.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (id: string, selected: string[], setSelected: (ids: string[]) => void) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  // Filtered data
  const filteredStartups = startups.filter(startup =>
    startup.name.toLowerCase().includes(startupSearch.toLowerCase()) ||
    startup.industry.toLowerCase().includes(startupSearch.toLowerCase())
  );

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
    job.company.toLowerCase().includes(jobSearch.toLowerCase())
  );

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate API calls
      const [statsData, usersData, startupsData, jobsData] = await Promise.all([
        fetchDashboardStats(),
        fetchUsers(),
        fetchStartups(),
        fetchJobs()
      ]);

      setStats(statsData);
      setUsers(usersData);
      setStartups(startupsData);
      setJobs(jobsData);
    } catch (error) {
      setAlertMessage('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Mock API functions
  const fetchDashboardStats = async (): Promise<DashboardStats> => {
    return {
      totalUsers: 15420,
      activeUsers: 8934,
      totalStartups: 2341,
      totalJobs: 5678,
      totalFunding: 234500000,
      systemHealth: 'healthy',
      recentActivity: [
        { type: 'user_registration', count: 45, timestamp: '2023-10-12T10:00:00Z' },
        { type: 'job_posted', count: 23, timestamp: '2023-10-12T09:00:00Z' },
        { type: 'funding_announced', count: 3, timestamp: '2023-10-12T08:00:00Z' }
      ]
    };
  };

  const fetchUsers = async (): Promise<User[]> => {
    return [
      {
        id: '1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        status: 'active',
        createdAt: '2023-01-15T10:30:00Z',
        lastLogin: '2023-10-12T08:45:00Z'
      },
      {
        id: '2',
        email: 'jane.smith@startup.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'founder',
        status: 'active',
        createdAt: '2023-02-20T14:20:00Z',
        lastLogin: '2023-10-12T09:15:00Z'
      }
    ];
  };

  const fetchStartups = async (): Promise<Startup[]> => {
    return [
      {
        id: '1',
        name: 'TechStartup Inc',
        industry: 'Technology',
        stage: 'Series A',
        status: 'active',
        founderId: '2',
        createdAt: '2023-03-01T12:00:00Z'
      }
    ];
  };

  const fetchJobs = async (): Promise<Job[]> => {
    return [
      {
        id: '1',
        title: 'Senior Software Engineer',
        company: 'TechStartup Inc',
        status: 'active',
        applications: 45,
        createdAt: '2023-10-01T10:00:00Z'
      }
    ];
  };

  const handleUserAction = async (userId: string, action: 'suspend' | 'activate' | 'delete') => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setUsers(users.map(user =>
        user.id === userId
          ? { ...user, status: action === 'activate' ? 'active' : 'suspended' }
          : user
      ));

      setAlertMessage(`User ${action}d successfully`);
    } catch (error) {
      setAlertMessage(`Failed to ${action} user`);
    }
  };

  const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> =
    ({ title, value, icon, color }) => (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography color="textSecondary" gutterBottom variant="body2">
                {title}
              </Typography>
              <Typography variant="h4" component="h2">
                {value}
              </Typography>
            </Box>
            <Box color={color}>
              {icon}
            </Box>
          </Box>
        </CardContent>
      </Card>
    );

  const UserManagementTab = () => (
    <Box>
      <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
        <Typography variant="h6">User Management</Typography>
        {selectedUserIds.length > 0 ? (
          <Box display="flex" alignItems="center" gap={1} bgcolor="action.selected" p={1} borderRadius={1}>
            <Typography variant="subtitle2" color="primary">
              {selectedUserIds.length} selected
            </Typography>
            <MuiTooltip title="Delete Selected">
              <IconButton size="small" color="error">
                <DeleteIcon />
              </IconButton>
            </MuiTooltip>
          </Box>
        ) : (
          <Button variant="contained" color="primary">
            Add User
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedUserIds.length > 0 && selectedUserIds.length < users.length}
                  checked={users.length > 0 && selectedUserIds.length === users.length}
                  onChange={(e) => handleSelectAllClick(e, users, setSelectedUserIds)}
                />
              </TableCell>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users
              .slice(usersPage * usersRowsPerPage, usersPage * usersRowsPerPage + usersRowsPerPage)
              .map((user) => {
                const isItemSelected = selectedUserIds.indexOf(user.id) !== -1;
                return (
                  <TableRow
                    key={user.id}
                    selected={isItemSelected}
                    onClick={() => handleClick(user.id, selectedUserIds, setSelectedUserIds)}
                    role="checkbox"
                  >
                    <TableCell padding="checkbox">
                      <Checkbox checked={isItemSelected} />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2 }}>
                          {user.firstName[0]}{user.lastName[0]}
                        </Avatar>
                        {user.firstName} {user.lastName}
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        color={user.role === 'admin' ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        color={user.status === 'active' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedUser(user);
                          setUserDialogOpen(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleUserAction(user.id, user.status === 'active' ? 'suspend' : 'activate')}
                      >
                        {user.status === 'active' ? <BlockIcon /> : <CheckCircleIcon />}
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleUserAction(user.id, 'delete')}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={users.length}
          rowsPerPage={usersRowsPerPage}
          page={usersPage}
          onPageChange={(_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => setUsersPage(newPage)}
          onRowsPerPageChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setUsersRowsPerPage(parseInt(event.target.value, 10));
            setUsersPage(0);
          }}
        />
      </TableContainer>
    </Box>
  );

  const AnalyticsTab = () => {
    const userGrowthData = [
      { month: 'Jan', users: 1200 },
      { month: 'Feb', users: 1800 },
      { month: 'Mar', users: 2400 },
      { month: 'Apr', users: 3200 },
      { month: 'May', users: 4100 },
      { month: 'Jun', users: 5200 }
    ];

    const industryData = [
      { name: 'Technology', value: 45, color: '#8884d8' },
      { name: 'Healthcare', value: 25, color: '#82ca9d' },
      { name: 'Finance', value: 20, color: '#ffc658' },
      { name: 'Education', value: 10, color: '#ff7300' }
    ];

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Platform Analytics
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  User Growth
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Startups by Industry
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={industryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {industryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const SystemHealthTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        System Health & Monitoring
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Service Status
              </Typography>
              {[
                { name: 'API Gateway', status: 'healthy', uptime: '99.9%' },
                { name: 'User Service', status: 'healthy', uptime: '99.8%' },
                { name: 'Job Service', status: 'warning', uptime: '98.5%' },
                { name: 'Database', status: 'healthy', uptime: '99.9%' },
                { name: 'Redis Cache', status: 'healthy', uptime: '99.7%' }
              ].map((service) => (
                <Box key={service.name} display="flex" alignItems="center" justifyContent="space-between" py={1}>
                  <Typography>{service.name}</Typography>
                  <Box display="flex" alignItems="center">
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      {service.uptime}
                    </Typography>
                    <Chip
                      label={service.status}
                      color={service.status === 'healthy' ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Metrics
              </Typography>
              <Box py={2}>
                <Typography variant="body2" gutterBottom>
                  Response Time (avg): 245ms
                </Typography>
                <LinearProgress variant="determinate" value={75} />
              </Box>
              <Box py={2}>
                <Typography variant="body2" gutterBottom>
                  CPU Usage: 45%
                </Typography>
                <LinearProgress variant="determinate" value={45} color="success" />
              </Box>
              <Box py={2}>
                <Typography variant="body2" gutterBottom>
                  Memory Usage: 68%
                </Typography>
                <LinearProgress variant="determinate" value={68} color="warning" />
              </Box>
              <Box py={2}>
                <Typography variant="body2" gutterBottom>
                  Error Rate: 0.2%
                </Typography>
                <LinearProgress variant="determinate" value={2} color="error" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {alertMessage && (
        <Alert
          severity="info"
          onClose={() => setAlertMessage(null)}
          sx={{ mb: 2 }}
        >
          {alertMessage}
        </Alert>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Admin Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadDashboardData}
        >
          Refresh
        </Button>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats?.totalUsers.toLocaleString() || '0'}
            icon={<PeopleIcon fontSize="large" />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Startups"
            value={stats?.totalStartups.toLocaleString() || '0'}
            icon={<BusinessIcon fontSize="large" />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Job Postings"
            value={stats?.totalJobs.toLocaleString() || '0'}
            icon={<WorkIcon fontSize="large" />}
            color="info.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Funding"
            value={`$${(stats?.totalFunding || 0) / 1000000}M`}
            icon={<MoneyIcon fontSize="large" />}
            color="warning.main"
          />
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="Overview" icon={<DashboardIcon />} />
            <Tab label="Users" icon={<PeopleIcon />} />
            <Tab label="Startups" icon={<BusinessIcon />} />
            <Tab label="Jobs" icon={<WorkIcon />} />
            <Tab label="Analytics" icon={<AnalyticsIcon />} />
            <Tab label="System Health" icon={<SecurityIcon />} />
            <Tab label="Settings" icon={<SettingsIcon />} />
          </Tabs>
        </Box>

        <CardContent>
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Platform Overview
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Recent Activity
                      </Typography>
                      {stats?.recentActivity.map((activity, index) => (
                        <Box key={index} display="flex" alignItems="center" py={1}>
                          <Badge badgeContent={activity.count} color="primary">
                            <Chip label={activity.type.replace('_', ' ')} size="small" />
                          </Badge>
                          <Typography variant="body2" sx={{ ml: 2 }}>
                            {new Date(activity.timestamp).toLocaleTimeString()}
                          </Typography>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        System Status
                      </Typography>
                      <Box display="flex" alignItems="center">
                        {stats?.systemHealth === 'healthy' ? (
                          <CheckCircleIcon color="success" />
                        ) : stats?.systemHealth === 'warning' ? (
                          <WarningIcon color="warning" />
                        ) : (
                          <ErrorIcon color="error" />
                        )}
                        <Typography sx={{ ml: 1 }}>
                          {stats?.systemHealth || 'Unknown'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
          {activeTab === 1 && <UserManagementTab />}
          {activeTab === 2 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Startup Management</Typography>
                <Box display="flex" gap={2}>
                  {selectedStartupIds.length > 0 ? (
                    <Box display="flex" alignItems="center" gap={1} bgcolor="action.selected" p={1} borderRadius={1}>
                      <Typography variant="subtitle2" color="primary">
                        {selectedStartupIds.length} selected
                      </Typography>
                      <MuiTooltip title="Delete Selected">
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </MuiTooltip>
                      <MuiTooltip title="Approve Selected">
                        <IconButton size="small" color="success">
                          <CheckCircleIcon />
                        </IconButton>
                      </MuiTooltip>
                    </Box>
                  ) : (
                    <TextField
                      size="small"
                      placeholder="Search startups..."
                      value={startupSearch}
                      onChange={(e) => setStartupSearch(e.target.value)}
                      sx={{ width: 250 }}
                    />
                  )}
                  <Button variant="contained" color="primary">
                    Add Startup
                  </Button>
                </Box>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={selectedStartupIds.length > 0 && selectedStartupIds.length < filteredStartups.length}
                          checked={filteredStartups.length > 0 && selectedStartupIds.length === filteredStartups.length}
                          onChange={(e) => handleSelectAllClick(e, filteredStartups, setSelectedStartupIds)}
                        />
                      </TableCell>
                      <TableCell>Startup</TableCell>
                      <TableCell>Industry</TableCell>
                      <TableCell>Stage</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Founded</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredStartups
                      .slice(startupsPage * startupsRowsPerPage, startupsPage * startupsRowsPerPage + startupsRowsPerPage)
                      .map((startup) => {
                        const isItemSelected = selectedStartupIds.indexOf(startup.id) !== -1;
                        return (
                          <TableRow
                            key={startup.id}
                            hover
                            selected={isItemSelected}
                            onClick={() => handleClick(startup.id, selectedStartupIds, setSelectedStartupIds)}
                            role="checkbox"
                          >
                            <TableCell padding="checkbox">
                              <Checkbox checked={isItemSelected} />
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                  {startup.name[0]}
                                </Avatar>
                                <Typography fontWeight={500}>{startup.name}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{startup.industry}</TableCell>
                            <TableCell>
                              <Chip label={startup.stage} size="small" color="info" />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={startup.status}
                                color={startup.status === 'active' ? 'success' : startup.status === 'pending' ? 'warning' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {new Date(startup.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <IconButton size="small">
                                <EditIcon />
                              </IconButton>
                              {startup.status === 'pending' && (
                                <IconButton size="small" color="success">
                                  <CheckCircleIcon />
                                </IconButton>
                              )}
                              <IconButton size="small" color="error">
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredStartups.length}
                  rowsPerPage={startupsRowsPerPage}
                  page={startupsPage}
                  onPageChange={(_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => setStartupsPage(newPage)}
                  onRowsPerPageChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                    setStartupsRowsPerPage(parseInt(event.target.value, 10));
                    setStartupsPage(0);
                  }}
                />
              </TableContainer>
            </Box>
          )}
          {activeTab === 3 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Job Management</Typography>
                <Box display="flex" gap={2}>
                  {selectedJobIds.length > 0 ? (
                    <Box display="flex" alignItems="center" gap={1} bgcolor="action.selected" p={1} borderRadius={1}>
                      <Typography variant="subtitle2" color="primary">
                        {selectedJobIds.length} selected
                      </Typography>
                      <MuiTooltip title="Delete Selected">
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </MuiTooltip>
                    </Box>
                  ) : (
                    <TextField
                      size="small"
                      placeholder="Search jobs..."
                      value={jobSearch}
                      onChange={(e) => setJobSearch(e.target.value)}
                      sx={{ width: 250 }}
                    />
                  )}
                  <Button variant="contained" color="primary">
                    Post Job
                  </Button>
                </Box>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={selectedJobIds.length > 0 && selectedJobIds.length < filteredJobs.length}
                          checked={filteredJobs.length > 0 && selectedJobIds.length === filteredJobs.length}
                          onChange={(e) => handleSelectAllClick(e, filteredJobs, setSelectedJobIds)}
                        />
                      </TableCell>
                      <TableCell>Job Title</TableCell>
                      <TableCell>Company</TableCell>
                      <TableCell>Applications</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Posted</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredJobs
                      .slice(jobsPage * jobsRowsPerPage, jobsPage * jobsRowsPerPage + jobsRowsPerPage)
                      .map((job) => {
                        const isItemSelected = selectedJobIds.indexOf(job.id) !== -1;
                        return (
                          <TableRow
                            key={job.id}
                            hover
                            selected={isItemSelected}
                            onClick={() => handleClick(job.id, selectedJobIds, setSelectedJobIds)}
                            role="checkbox"
                          >
                            <TableCell padding="checkbox">
                              <Checkbox checked={isItemSelected} />
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight={500}>{job.title}</Typography>
                            </TableCell>
                            <TableCell>{job.company}</TableCell>
                            <TableCell>
                              <Chip label={job.applications} color="primary" size="small" />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={job.status}
                                color={job.status === 'active' ? 'success' : job.status === 'pending' ? 'warning' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {new Date(job.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <IconButton size="small">
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color={job.status === 'active' ? 'warning' : 'success'}
                              >
                                {job.status === 'active' ? <BlockIcon /> : <CheckCircleIcon />}
                              </IconButton>
                              <IconButton size="small" color="error">
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredJobs.length}
                  rowsPerPage={jobsRowsPerPage}
                  page={jobsPage}
                  onPageChange={(_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => setJobsPage(newPage)}
                  onRowsPerPageChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                    setJobsRowsPerPage(parseInt(event.target.value, 10));
                    setJobsPage(0);
                  }}
                />
              </TableContainer>
            </Box>
          )}
          {activeTab === 4 && <AnalyticsTab />}
          {activeTab === 5 && <SystemHealthTab />}
          {activeTab === 6 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Platform Settings
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        General Settings
                      </Typography>
                      <Box py={2}>
                        <TextField
                          fullWidth
                          label="Platform Name"
                          defaultValue="StartupCompass"
                          margin="normal"
                        />
                        <TextField
                          fullWidth
                          label="Support Email"
                          defaultValue="support@startupcompass.com"
                          margin="normal"
                        />
                        <TextField
                          fullWidth
                          label="Max Upload Size (MB)"
                          type="number"
                          defaultValue="10"
                          margin="normal"
                        />
                      </Box>
                      <Button variant="contained" color="primary">
                        Save Changes
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Email Notifications
                      </Typography>
                      <Box py={2}>
                        <FormControl fullWidth margin="normal">
                          <InputLabel>New User Registration</InputLabel>
                          <Select defaultValue="enabled">
                            <MenuItem value="enabled">Enabled</MenuItem>
                            <MenuItem value="disabled">Disabled</MenuItem>
                          </Select>
                        </FormControl>
                        <FormControl fullWidth margin="normal">
                          <InputLabel>Job Application Alerts</InputLabel>
                          <Select defaultValue="enabled">
                            <MenuItem value="enabled">Enabled</MenuItem>
                            <MenuItem value="disabled">Disabled</MenuItem>
                          </Select>
                        </FormControl>
                        <FormControl fullWidth margin="normal">
                          <InputLabel>System Alerts</InputLabel>
                          <Select defaultValue="enabled">
                            <MenuItem value="enabled">Enabled</MenuItem>
                            <MenuItem value="disabled">Disabled</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                      <Button variant="contained" color="primary">
                        Save Changes
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* User Edit Dialog */}
      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box>
              <TextField
                fullWidth
                label="First Name"
                value={selectedUser.firstName}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Last Name"
                value={selectedUser.lastName}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Email"
                value={selectedUser.email}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Role</InputLabel>
                <Select value={selectedUser.role}>
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="founder">Founder</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select value={selectedUser.status}>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setUserDialogOpen(false)}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;