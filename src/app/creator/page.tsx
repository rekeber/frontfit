'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Avatar,
  LinearProgress,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Fab
} from '@mui/material';
import {
  TrendingUp,
  MonetizationOn,
  Visibility,
  ThumbUp,
  Share,
  Add,
  Edit,
  Publish,
  Analytics,
  Star,
  EmojiEvents,
  VideoCall,
  Article,
  Restaurant,
  FitnessCenter
} from '@mui/icons-material';
import { apiService } from '@/services/apiService';
import {
  Creator,
  CreatorContent,
  CreatorAnalytics,
  CreatorApplicationRequest,
  CreateContentRequest,
  ContentType,
  CreatorTier,
  ApplicationStatus
} from '@/types/creator';
import toast from 'react-hot-toast';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`creator-tabpanel-${index}`}
      aria-labelledby={`creator-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const CreatorDashboard: React.FC = () => {
  const [creator, setCreator] = useState<Creator | null>(null);
  const [analytics, setAnalytics] = useState<CreatorAnalytics | null>(null);
  const [content, setContent] = useState<CreatorContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [showContentDialog, setShowContentDialog] = useState(false);
  const [applicationData, setApplicationData] = useState({
    creatorHandle: '',
    bio: '',
    specialties: [] as string[]
  });
  const [contentData, setContentData] = useState({
    title: '',
    description: '',
    contentType: ContentType.VIDEO,
    tags: [] as string[]
  });

  const specialtyOptions = [
    'Weight Loss', 'Muscle Building', 'Cardio', 'Strength Training',
    'Yoga', 'Pilates', 'Nutrition', 'Meal Prep', 'Supplements',
    'Mental Health', 'Motivation', 'Beginner Fitness'
  ];

  const contentTypeOptions = [
    { value: ContentType.VIDEO, label: 'Video', icon: <VideoCall /> },
    { value: ContentType.ARTICLE, label: 'Article', icon: <Article /> },
    { value: ContentType.RECIPE, label: 'Recipe', icon: <Restaurant /> },
    { value: ContentType.WORKOUT, label: 'Workout', icon: <FitnessCenter /> }
  ];

  useEffect(() => {
    loadCreatorData();
  }, []);

  const loadCreatorData = async () => {
    try {
      setLoading(true);
      
      // Try to get creator profile
      try {
        const creatorResponse = await apiService.getCreatorProfile();
        setCreator(creatorResponse.data);
        
        // Load analytics and content if creator exists
        const [analyticsResponse, contentResponse] = await Promise.all([
          apiService.getCreatorAnalytics(),
          apiService.getCreatorContent(creatorResponse.data.id)
        ]);
        
        setAnalytics(analyticsResponse.data);
        setContent(contentResponse.data);
      } catch (error: any) {
        // Creator doesn't exist yet
        if (error.response?.status === 404) {
          setCreator(null);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error loading creator data:', error);
      toast.error('Failed to load creator data');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToBeCreator = async () => {
    try {
      const request: CreatorApplicationRequest = {
        creatorHandle: applicationData.creatorHandle,
        bio: applicationData.bio,
        specialties: applicationData.specialties
      };

      await apiService.applyToBeCreator(request);
      toast.success('Creator application submitted successfully!');
      setShowApplicationDialog(false);
      loadCreatorData();
    } catch (error) {
      console.error('Error applying to be creator:', error);
      toast.error('Failed to submit creator application');
    }
  };

  const handleCreateContent = async () => {
    try {
      const request: CreateContentRequest = {
        title: contentData.title,
        description: contentData.description,
        contentType: contentData.contentType,
        tags: contentData.tags
      };

      await apiService.createContent(request);
      toast.success('Content created successfully!');
      setShowContentDialog(false);
      loadCreatorData();
    } catch (error) {
      console.error('Error creating content:', error);
      toast.error('Failed to create content');
    }
  };

  const handlePublishContent = async (contentId: number) => {
    try {
      await apiService.publishContent(contentId);
      toast.success('Content published successfully!');
      loadCreatorData();
    } catch (error) {
      console.error('Error publishing content:', error);
      toast.error('Failed to publish content');
    }
  };

  const getTierColor = (tier: CreatorTier) => {
    switch (tier) {
      case CreatorTier.BRONZE: return '#CD7F32';
      case CreatorTier.SILVER: return '#C0C0C0';
      case CreatorTier.GOLD: return '#FFD700';
      case CreatorTier.DIAMOND: return '#B9F2FF';
      default: return '#CD7F32';
    }
  };

  const getTierIcon = (tier: CreatorTier) => {
    switch (tier) {
      case CreatorTier.DIAMOND: return '💎';
      case CreatorTier.GOLD: return '🥇';
      case CreatorTier.SILVER: return '🥈';
      case CreatorTier.BRONZE: return '🥉';
      default: return '🥉';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <LinearProgress sx={{ width: '100%', maxWidth: 400 }} />
        </Box>
      </Container>
    );
  }

  // Not a creator yet - show application form
  if (!creator) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card sx={{ textAlign: 'center', p: 4 }}>
            <CardContent>
              <EmojiEvents sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" gutterBottom>
                Become a FitLife Creator
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Join our creator economy and start earning money by sharing your fitness expertise!
                Create content, build your audience, and collaborate with brands.
              </Typography>
              
              <Grid container spacing={3} sx={{ my: 3 }}>
                <Grid item xs={12} md={4}>
                  <Box>
                    <MonetizationOn sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="h6">Earn Money</Typography>
                    <Typography variant="body2" color="text.secondary">
                      70-80% revenue share based on your tier
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box>
                    <TrendingUp sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6">Grow Your Audience</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Reach millions of fitness enthusiasts
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Star sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                    <Typography variant="h6">Brand Partnerships</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Collaborate with top fitness brands
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Button
                variant="contained"
                size="large"
                onClick={() => setShowApplicationDialog(true)}
                sx={{ mt: 2 }}
              >
                Apply to Become Creator
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Application Dialog */}
        <Dialog open={showApplicationDialog} onClose={() => setShowApplicationDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Apply to Become a Creator</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Creator Handle"
                value={applicationData.creatorHandle}
                onChange={(e) => setApplicationData(prev => ({ ...prev, creatorHandle: e.target.value }))}
                placeholder="@your_handle"
                sx={{ mb: 3 }}
              />
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Bio"
                value={applicationData.bio}
                onChange={(e) => setApplicationData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about your fitness journey and expertise..."
                sx={{ mb: 3 }}
              />

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Specialties</InputLabel>
                <Select
                  multiple
                  value={applicationData.specialties}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, specialties: e.target.value as string[] }))}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {specialtyOptions.map((specialty) => (
                    <MenuItem key={specialty} value={specialty}>
                      {specialty}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowApplicationDialog(false)}>Cancel</Button>
            <Button onClick={handleApplyToBeCreator} variant="contained">Submit Application</Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  }

  // Creator dashboard
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}>
              {creator.creatorHandle.charAt(1).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h4">
                {creator.creatorHandle}
                <Chip 
                  label={`${getTierIcon(creator.tier)} ${creator.tier}`}
                  sx={{ ml: 2, bgcolor: getTierColor(creator.tier), color: 'white' }}
                />
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {creator.bio}
              </Typography>
            </Box>
          </Box>
          
          {creator.applicationStatus === ApplicationStatus.APPROVED && (
            <Fab
              color="primary"
              onClick={() => setShowContentDialog(true)}
              sx={{ position: 'fixed', bottom: 16, right: 16 }}
            >
              <Add />
            </Fab>
          )}
        </Box>

        {/* Application Status Alert */}
        {creator.applicationStatus === ApplicationStatus.PENDING && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Your creator application is under review. We&apos;ll notify you once it&apos;s approved!
          </Alert>
        )}

        {creator.applicationStatus === ApplicationStatus.REJECTED && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Your creator application was not approved. Please contact support for more information.
          </Alert>
        )}

        {/* Analytics Cards */}
        {analytics && creator.applicationStatus === ApplicationStatus.APPROVED && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <TrendingUp color="primary" />
                    <Box>
                      <Typography variant="h4">{analytics.totalFollowers.toLocaleString()}</Typography>
                      <Typography variant="body2" color="text.secondary">Followers</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Visibility color="info" />
                    <Box>
                      <Typography variant="h4">{analytics.totalViews.toLocaleString()}</Typography>
                      <Typography variant="body2" color="text.secondary">Total Views</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <MonetizationOn color="success" />
                    <Box>
                      <Typography variant="h4">${analytics.totalEarnings}</Typography>
                      <Typography variant="body2" color="text.secondary">Total Earnings</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Analytics color="warning" />
                    <Box>
                      <Typography variant="h4">{analytics.engagementRate}%</Typography>
                      <Typography variant="body2" color="text.secondary">Engagement</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tabs */}
        {creator.applicationStatus === ApplicationStatus.APPROVED && (
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label="Content" />
                <Tab label="Analytics" />
                <Tab label="Earnings" />
                <Tab label="Collaborations" />
              </Tabs>
            </Box>

            {/* Content Tab */}
            <TabPanel value={tabValue} index={0}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Views</TableCell>
                      <TableCell>Likes</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {content.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.title}</TableCell>
                        <TableCell>
                          <Chip label={item.contentType} size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={item.isPublished ? 'Published' : 'Draft'}
                            color={item.isPublished ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{item.viewCount.toLocaleString()}</TableCell>
                        <TableCell>{item.likeCount.toLocaleString()}</TableCell>
                        <TableCell>
                          {!item.isPublished && (
                            <IconButton onClick={() => handlePublishContent(item.id)}>
                              <Publish />
                            </IconButton>
                          )}
                          <IconButton>
                            <Edit />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            {/* Analytics Tab */}
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>Performance Analytics</Typography>
              <Typography variant="body2" color="text.secondary">
                Detailed analytics coming soon...
              </Typography>
            </TabPanel>

            {/* Earnings Tab */}
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>Earnings Overview</Typography>
              <Typography variant="body2" color="text.secondary">
                Earnings breakdown coming soon...
              </Typography>
            </TabPanel>

            {/* Collaborations Tab */}
            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" gutterBottom>Brand Collaborations</Typography>
              <Typography variant="body2" color="text.secondary">
                Collaboration management coming soon...
              </Typography>
            </TabPanel>
          </>
        )}

        {/* Create Content Dialog */}
        <Dialog open={showContentDialog} onClose={() => setShowContentDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Create New Content</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Title"
                value={contentData.title}
                onChange={(e) => setContentData(prev => ({ ...prev, title: e.target.value }))}
                sx={{ mb: 3 }}
              />
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={contentData.description}
                onChange={(e) => setContentData(prev => ({ ...prev, description: e.target.value }))}
                sx={{ mb: 3 }}
              />

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Content Type</InputLabel>
                <Select
                  value={contentData.contentType}
                  onChange={(e) => setContentData(prev => ({ ...prev, contentType: e.target.value as ContentType }))}
                >
                  {contentTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {option.icon}
                        {option.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Tags (comma separated)"
                placeholder="fitness, workout, nutrition"
                onChange={(e) => setContentData(prev => ({ 
                  ...prev, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                }))}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowContentDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateContent} variant="contained">Create Content</Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default CreatorDashboard;