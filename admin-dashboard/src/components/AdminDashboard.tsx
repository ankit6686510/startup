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
  Avatar
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { adminAPI, DashboardStats, User, Startup, Job, SystemHealth, getStatusColor } from '../services/AdminAPI';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, startupsRes, jobsRes, healthRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getUsers(),
        adminAPI.getStartups(),
        adminAPI.getJobs(),
        adminAPI.getSystemHealth()
      ]);

      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (usersRes.success && usersRes.data) setUsers(usersRes.data.users);
      if (startupsRes.success && startupsRes.data) setStartups(startupsRes.data.startups);
      if (jobsRes.success && jobsRes.data) setJobs(jobsRes.data.jobs);
      if (healthRes.success && healthRes.data) setSystemHealth(healthRes.data);

    } catch (error) {
      setAlertMessage('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'suspend' | 'activate' | 'delete') => {
    try {
      let response;
      if (action === 'suspend') {
        response = await adminAPI.suspendUser(userId);
      } else if (action === 'activate') {
        response = await adminAPI.activateUser(userId);
      } else {
        response = await adminAPI.deleteUser(userId);
      }

      if (response.success) {
         setUsers(users.map(user =>
            user.id === userId && action !== 'delete'
              ? { ...user, status: action === 'activate' ? 'active' : 'suspended' }
              : user
          ).filter(user => action !== 'delete' || user.id !== userId));

        setAlertMessage(`User ${action}d successfully`);
      } else {
        setAlertMessage(`Failed to ${action} user: ${response.message}`);
      }
    } catch (error) {
      setAlertMessage(`Failed to ${action} user`);
    }
  };

  const handleStartupAction = async (startupId: string, action: 'approve' | 'suspend' | 'delete') => {
    try {
      let response;
      if (action === 'approve') {
        response = await adminAPI.approveStartup(startupId);
      } else if (action === 'suspend') {
        response = await adminAPI.suspendStartup(startupId, 'Admin action');
      } else {
        response = await adminAPI.deleteStartup(startupId);
      }

      if (response.success) {
        setStartups(startups.map(startup =>
           startup.id === startupId && action !== 'delete'
             ? { ...startup, status: action === 'approve' ? 'active' : 'suspended' }
             : startup
         ).filter(startup => action !== 'delete' || startup.id !== startupId));

        setAlertMessage(`Startup ${action}d successfully`);
      } else {
         setAlertMessage(`Failed to ${action} startup: ${response.message}`);
      }
    } catch (error) {
      setAlertMessage(`Failed to ${action} startup`);
    }
  };

  const handleJobAction = async (jobId: string, action: 'activate' | 'suspend' | 'delete') => {
    try {
      let response;
      if (action === 'activate') {
        response = await adminAPI.activateJob(jobId);
      } else if (action === 'suspend') {
        response = await adminAPI.suspendJob(jobId, 'Admin action');
      } else {
        response = await adminAPI.deleteJob(jobId);
      }

      if (response.success) {
        setJobs(jobs.map(job =>
           job.id === jobId && action !== 'delete'
             ? { ...job, status: action === 'activate' ? 'active' : 'suspended' }
             : job
         ).filter(job => action !== 'delete' || job.id !== jobId));

        setAlertMessage(`Job ${action}d successfully`);
      } else {
         setAlertMessage(`Failed to ${action} job: ${response.message}`);
      }
    } catch (error) {
      setAlertMessage(`Failed to ${action} job`);
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">User Management</Typography>
        <Button variant="contained" color="primary">
          Add User
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
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
                    color={getStatusColor(user.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                </TableCell>
                <TableCell>
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const StartupManagementTab = () => (
    <Box>
       <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Startup Management</Typography>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Industry</TableCell>
              <TableCell>Stage</TableCell>
              <TableCell>Founder</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {startups.map((startup) => (
              <TableRow key={startup.id}>
                <TableCell>{startup.name}</TableCell>
                <TableCell>{startup.industry}</TableCell>
                <TableCell>{startup.stage}</TableCell>
                <TableCell>{startup.founderName}</TableCell>
                <TableCell>
                  <Chip
                    label={startup.status}
                    color={getStatusColor(startup.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    color="success"
                    onClick={() => handleStartupAction(startup.id, 'approve')}
                    disabled={startup.status === 'active'}
                    title="Approve"
                  >
                    <CheckCircleIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="warning"
                    onClick={() => handleStartupAction(startup.id, 'suspend')}
                     disabled={startup.status === 'suspended'}
                     title="Suspend"
                  >
                    <BlockIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleStartupAction(startup.id, 'delete')}
                    title="Delete"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const JobManagementTab = () => (
    <Box>
       <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Job Management</Typography>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Applications</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>{job.title}</TableCell>
                <TableCell>{job.company}</TableCell>
                <TableCell>{job.type}</TableCell>
                <TableCell>{job.location} {job.remote && '(Remote)'}</TableCell>
                <TableCell>
                  <Chip
                    label={job.status}
                    color={getStatusColor(job.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{job.applications}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    color="success"
                    onClick={() => handleJobAction(job.id, 'activate')}
                    disabled={job.status === 'active'}
                    title="Activate"
                  >
                    <CheckCircleIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="warning"
                    onClick={() => handleJobAction(job.id, 'suspend')}
                     disabled={job.status === 'suspended'}
                     title="Suspend"
                  >
                    <BlockIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleJobAction(job.id, 'delete')}
                    title="Delete"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const AnalyticsTab = () => {
    if (!stats) return <Typography>No analytics data available</Typography>;

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
                  <LineChart data={stats.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="startups" stroke="#82ca9d" strokeWidth={2} />
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
                      data={stats.industryDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="name"
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                    >
                      {stats.industryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d', '#ffc658', '#ff7300'][index % 4]} />
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

  const SystemHealthTab = () => {
    if (!systemHealth) return <Typography>No system health data available</Typography>;

    return (
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
              {systemHealth.services.map((service) => (
                 <Box key={service.name} display="flex" alignItems="center" justifyContent="space-between" py={1}>
                  <Typography>{service.name}</Typography>
                   <Box display="flex" alignItems="center">
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      {service.uptime}%
                    </Typography>
                    <Chip
                      label={service.status}
                      color={getStatusColor(service.status)}
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
                  Response Time (avg): {Math.round(systemHealth.services.reduce((acc, curr) => acc + curr.responseTime, 0) / systemHealth.services.length)}ms
                </Typography>
                <LinearProgress variant="determinate" value={75} />
              </Box>
              <Box py={2}>
                <Typography variant="body2" gutterBottom>
                  CPU Usage: {systemHealth.metrics.cpu}%
                </Typography>
                <LinearProgress variant="determinate" value={systemHealth.metrics.cpu} color="success" />
              </Box>
              <Box py={2}>
                <Typography variant="body2" gutterBottom>
                  Memory Usage: {systemHealth.metrics.memory}%
                </Typography>
                <LinearProgress variant="determinate" value={systemHealth.metrics.memory} color="warning" />
              </Box>
              <Box py={2}>
                <Typography variant="body2" gutterBottom>
                  Database Connections: {systemHealth.metrics.database.connections}
                </Typography>
                <LinearProgress variant="determinate" value={Math.min(systemHealth.metrics.database.connections / 2, 100)} color="info" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
    );
  };

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
                          <Chip label={activity.type.replace('_', ' ')} size="small" />
                          <Box ml={2}>
                              <Typography variant="body2">
                                  {activity.description}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {new Date(activity.timestamp).toLocaleTimeString()}
                              </Typography>
                          </Box>
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
          {activeTab === 2 && <StartupManagementTab />}
          {activeTab === 3 && <JobManagementTab />}
          {activeTab === 4 && <AnalyticsTab />}
          {activeTab === 5 && <SystemHealthTab />}
          {activeTab === 6 && (
            <Typography>Settings content goes here</Typography>
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