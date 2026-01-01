'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import confetti from 'canvas-confetti';
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
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Fab,
  IconButton,
  Badge,
  Divider,
  Alert
} from '@mui/material';
import {
  MonetizationOn,
  CardGiftcard,
  EmojiEvents,
  TrendingUp,
  Star,
  Refresh,
  Casino,
  Person,
  Leaderboard,
  History,
  Settings,
  LocalFireDepartment,
  FitnessCenter,
  Restaurant,
  SocialDistance,
  Timeline,
  Diamond,
  Celebration
} from '@mui/icons-material';
import { apiService } from '@/services/apiService';
import {
  FitCoinBalance,
  LootBox,
  UserAvatar,
  LootBoxRewards,
  DailySpinResult,
  Leaderboard as LeaderboardType,
  GamificationStats,
  BoxType,
  Rarity,
  TransactionType,
  CoinSource
} from '@/types/gamification';
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
      id={`gamification-tabpanel-${index}`}
      aria-labelledby={`gamification-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const GamificationPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fitCoinBalance, setFitCoinBalance] = useState<FitCoinBalance | null>(null);
  const [lootBoxes, setLootBoxes] = useState<LootBox[]>([]);
  const [userAvatar, setUserAvatar] = useState<UserAvatar | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardType | null>(null);
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [showLootBoxDialog, setShowLootBoxDialog] = useState(false);
  const [selectedLootBox, setSelectedLootBox] = useState<LootBox | null>(null);
  const [lootBoxRewards, setLootBoxRewards] = useState<LootBoxRewards | null>(null);
  const [showSpinDialog, setShowSpinDialog] = useState(false);
  const [spinResult, setSpinResult] = useState<DailySpinResult | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    loadGamificationData();
  }, []);

  const loadGamificationData = async () => {
    try {
      setLoading(true);
      
      const [
        balanceResponse,
        lootBoxResponse,
        avatarResponse,
        leaderboardResponse,
        statsResponse
      ] = await Promise.all([
        apiService.getFitCoinBalance(),
        apiService.getUserLootBoxes(),
        apiService.getUserAvatar(),
        apiService.getLeaderboard('FITCOINS'),
        apiService.getGamificationStats()
      ]);

      setFitCoinBalance(balanceResponse.data);
      setLootBoxes(lootBoxResponse.data);
      setUserAvatar(avatarResponse.data);
      setLeaderboard(leaderboardResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error loading gamification data:', error);
      toast.error('Failed to load gamification data');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimDailyLootBox = async () => {
    try {
      const response = await apiService.claimDailyLootBox();
      toast.success('Daily loot box claimed!');
      setLootBoxes(prev => [...prev, response.data]);
      loadGamificationData();
    } catch (error: any) {
      if (error.response?.status === 400) {
        toast.error('Daily loot box already claimed today');
      } else {
        toast.error('Failed to claim daily loot box');
      }
    }
  };

  const handleOpenLootBox = async (lootBox: LootBox) => {
    try {
      setSelectedLootBox(lootBox);
      const response = await apiService.openLootBox(lootBox.id);
      setLootBoxRewards(response.data);
      setShowLootBoxDialog(true);
      
      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      toast.success('Loot box opened!');
      loadGamificationData();
    } catch (error) {
      console.error('Error opening loot box:', error);
      toast.error('Failed to open loot box');
    }
  };

  const handleDailySpin = async () => {
    try {
      setIsSpinning(true);
      setShowSpinDialog(true);
      
      // Simulate spinning animation
      setTimeout(async () => {
        try {
          const response = await apiService.performDailySpin();
          setSpinResult(response.data);
          setIsSpinning(false);
          
          // Trigger confetti for good rewards
          if (response.data.fitcoins && parseInt(response.data.fitcoins) > 50) {
            confetti({
              particleCount: 150,
              spread: 100,
              origin: { y: 0.6 }
            });
          }
          
          toast.success(`You won ${response.data.fitcoins} FitCoins!`);
          loadGamificationData();
        } catch (error: any) {
          setIsSpinning(false);
          if (error.response?.status === 400) {
            toast.error('Daily spin already used today');
          } else {
            toast.error('Failed to perform daily spin');
          }
        }
      }, 3000);
    } catch (error) {
      setIsSpinning(false);
      console.error('Error performing daily spin:', error);
    }
  };

  const getRarityColor = (rarity: Rarity) => {
    switch (rarity) {
      case Rarity.COMMON: return '#9E9E9E';
      case Rarity.UNCOMMON: return '#4CAF50';
      case Rarity.RARE: return '#2196F3';
      case Rarity.EPIC: return '#9C27B0';
      case Rarity.LEGENDARY: return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getRarityIcon = (rarity: Rarity) => {
    switch (rarity) {
      case Rarity.LEGENDARY: return '🌟';
      case Rarity.EPIC: return '💜';
      case Rarity.RARE: return '💙';
      case Rarity.UNCOMMON: return '💚';
      case Rarity.COMMON: return '⚪';
      default: return '⚪';
    }
  };

  const getSourceIcon = (source: CoinSource) => {
    switch (source) {
      case CoinSource.WORKOUT_COMPLETED: return <FitnessCenter />;
      case CoinSource.NUTRITION_LOGGED: return <Restaurant />;
      case CoinSource.DAILY_LOGIN: return <Star />;
      case CoinSource.ACHIEVEMENT_UNLOCKED: return <EmojiEvents />;
      case CoinSource.SOCIAL_INTERACTION: return <SocialDistance />;
      case CoinSource.STREAK_BONUS: return <Timeline />;
      default: return <MonetizationOn />;
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" gutterBottom>
              🎮 Rewards Center
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Earn FitCoins, open loot boxes, and climb the leaderboards!
            </Typography>
          </Box>
          
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              startIcon={<CardGiftcard />}
              onClick={handleClaimDailyLootBox}
              sx={{ bgcolor: 'success.main' }}
            >
              Daily Box
            </Button>
            <Button
              variant="contained"
              startIcon={<Casino />}
              onClick={handleDailySpin}
              sx={{ bgcolor: 'warning.main' }}
            >
              Daily Spin
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <MonetizationOn sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4">{stats.fitcoinsBalance}</Typography>
                      <Typography variant="body2">FitCoins</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <EmojiEvents sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4">{stats.unlockedAchievements}/{stats.totalAchievements}</Typography>
                      <Typography variant="body2">Achievements</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <LocalFireDepartment sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4">{stats.currentStreak}</Typography>
                      <Typography variant="body2">Day Streak</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Badge badgeContent={stats.unopenedLootBoxes} color="error">
                      <CardGiftcard sx={{ fontSize: 40 }} />
                    </Badge>
                    <Box>
                      <Typography variant="h4">{stats.totalLootBoxes}</Typography>
                      <Typography variant="body2">Loot Boxes</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Loot Boxes" icon={<CardGiftcard />} />
            <Tab label="FitCoins" icon={<MonetizationOn />} />
            <Tab label="Avatar" icon={<Person />} />
            <Tab label="Leaderboard" icon={<Leaderboard />} />
          </Tabs>
        </Box>

        {/* Loot Boxes Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {lootBoxes.filter(box => !box.isOpened).map((lootBox) => (
              <Grid item xs={12} sm={6} md={4} key={lootBox.id}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: `2px solid ${getRarityColor(lootBox.rarity)}`,
                      bgcolor: `${getRarityColor(lootBox.rarity)}10`
                    }}
                    onClick={() => handleOpenLootBox(lootBox)}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h2" sx={{ mb: 2 }}>
                        {getRarityIcon(lootBox.rarity)}
                      </Typography>
                      <Typography variant="h6" gutterBottom>
                        {lootBox.boxType.replace('_', ' ')} Box
                      </Typography>
                      <Chip 
                        label={lootBox.rarity}
                        sx={{ 
                          bgcolor: getRarityColor(lootBox.rarity),
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Click to open!
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
            
            {lootBoxes.filter(box => !box.isOpened).length === 0 && (
              <Grid item xs={12}>
                <Alert severity="info">
                  No loot boxes available. Complete workouts, log nutrition, or claim your daily box to earn more!
                </Alert>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        {/* FitCoins Tab */}
        <TabPanel value={tabValue} index={1}>
          {fitCoinBalance && (
            <Box>
              <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'white' }}>
                <CardContent>
                  <Typography variant="h4" gutterBottom>
                    💰 {fitCoinBalance.currentBalance} FitCoins
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2">Total Earned</Typography>
                      <Typography variant="h6">{fitCoinBalance.totalEarned}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">Total Spent</Typography>
                      <Typography variant="h6">{fitCoinBalance.totalSpent}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Typography variant="h6" gutterBottom>Recent Transactions</Typography>
              <List>
                {fitCoinBalance.recentTransactions.map((transaction) => (
                  <ListItem key={transaction.id}>
                    <ListItemIcon>
                      {getSourceIcon(transaction.source)}
                    </ListItemIcon>
                    <ListItemText
                      primary={transaction.description}
                      secondary={new Date(transaction.createdAt).toLocaleDateString()}
                    />
                    <Typography
                      variant="h6"
                      color={transaction.transactionType === TransactionType.EARNED ? 'success.main' : 'error.main'}
                    >
                      {transaction.transactionType === TransactionType.EARNED ? '+' : '-'}{transaction.amount}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </TabPanel>

        {/* Avatar Tab */}
        <TabPanel value={tabValue} index={2}>
          {userAvatar && (
            <Box>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {userAvatar.avatarName}
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ textAlign: 'center', p: 3 }}>
                        <Avatar
                          sx={{ 
                            width: 150, 
                            height: 150, 
                            bgcolor: 'primary.main',
                            fontSize: '4rem',
                            mx: 'auto',
                            mb: 2
                          }}
                        >
                          🏃‍♂️
                        </Avatar>
                        <Typography variant="h6">Level {userAvatar.fitnessLevel}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" gutterBottom>Transformation Progress</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={userAvatar.transformationProgress} 
                        sx={{ mb: 2, height: 10, borderRadius: 5 }}
                      />
                      
                      <Typography variant="body2" gutterBottom>Muscle Definition</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={userAvatar.muscleDefinition} 
                        sx={{ mb: 2, height: 10, borderRadius: 5 }}
                        color="secondary"
                      />
                      
                      <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Weight Lost</Typography>
                          <Typography variant="h6">{userAvatar.totalWeightLost} lbs</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Workouts</Typography>
                          <Typography variant="h6">{userAvatar.totalWorkoutsCompleted}</Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              
              <Button variant="contained" startIcon={<Settings />}>
                Customize Avatar
              </Button>
            </Box>
          )}
        </TabPanel>

        {/* Leaderboard Tab */}
        <TabPanel value={tabValue} index={3}>
          {leaderboard && (
            <Box>
              <Typography variant="h6" gutterBottom>
                🏆 FitCoins Leaderboard
              </Typography>
              <List>
                {leaderboard.entries.map((entry, index) => (
                  <ListItem key={entry.userId}>
                    <ListItemIcon>
                      <Typography variant="h6">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${entry.rank}`}
                      </Typography>
                    </ListItemIcon>
                    <ListItemText
                      primary={entry.name}
                      secondary={`Rank ${entry.rank}`}
                    />
                    <Typography variant="h6" color="primary">
                      {entry.score.toLocaleString()} FC
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </TabPanel>

        {/* Loot Box Opening Dialog */}
        <Dialog open={showLootBoxDialog} onClose={() => setShowLootBoxDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ textAlign: 'center' }}>
            <Celebration sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h5">Loot Box Opened!</Typography>
          </DialogTitle>
          <DialogContent>
            {lootBoxRewards && (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h6" gutterBottom>You received:</Typography>
                
                {lootBoxRewards.fitcoins && (
                  <Box sx={{ mb: 2 }}>
                    <MonetizationOn sx={{ fontSize: 30, color: 'primary.main' }} />
                    <Typography variant="h5">{lootBoxRewards.fitcoins} FitCoins</Typography>
                  </Box>
                )}
                
                {lootBoxRewards.fitgems > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Diamond sx={{ fontSize: 30, color: 'info.main' }} />
                    <Typography variant="h5">{lootBoxRewards.fitgems} FitGems</Typography>
                  </Box>
                )}
                
                {lootBoxRewards.avatarItems.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Person sx={{ fontSize: 30, color: 'secondary.main' }} />
                    <Typography variant="h6">Avatar Items:</Typography>
                    {lootBoxRewards.avatarItems.map((item, index) => (
                      <Chip key={index} label={item} sx={{ m: 0.5 }} />
                    ))}
                  </Box>
                )}
                
                {lootBoxRewards.specialRewards.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Star sx={{ fontSize: 30, color: 'warning.main' }} />
                    <Typography variant="h6">Special Rewards:</Typography>
                    {lootBoxRewards.specialRewards.map((reward, index) => (
                      <Chip key={index} label={reward} color="warning" sx={{ m: 0.5 }} />
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowLootBoxDialog(false)} variant="contained" fullWidth>
              Awesome!
            </Button>
          </DialogActions>
        </Dialog>

        {/* Daily Spin Dialog */}
        <Dialog open={showSpinDialog} onClose={() => setShowSpinDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ textAlign: 'center' }}>
            <Casino sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h5">Daily Spin</Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              {isSpinning ? (
                <Box>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Casino sx={{ fontSize: 100, color: 'warning.main' }} />
                  </motion.div>
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Spinning...
                  </Typography>
                </Box>
              ) : spinResult ? (
                <Box>
                  <Celebration sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                  <Typography variant="h5" gutterBottom>
                    Congratulations!
                  </Typography>
                  <Typography variant="h4" color="primary">
                    +{spinResult.fitcoins} FitCoins
                  </Typography>
                  {spinResult.specialReward && (
                    <Typography variant="h6" sx={{ mt: 2 }}>
                      Bonus: {spinResult.specialReward}
                    </Typography>
                  )}
                </Box>
              ) : null}
            </Box>
          </DialogContent>
          {!isSpinning && (
            <DialogActions>
              <Button onClick={() => setShowSpinDialog(false)} variant="contained" fullWidth>
                Claim Reward
              </Button>
            </DialogActions>
          )}
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default GamificationPage;