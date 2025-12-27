import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Avatar, 
  Button, 
  IconButton,
  Divider,
  Chip
} from '@mui/material';
import { 
  Favorite, 
  FavoriteBorder, 
  Comment, 
  Share, 
  Add,
  People 
} from '@mui/icons-material';

const SocialPage: React.FC = () => {
  const posts = [
    {
      user: 'María González',
      avatar: 'M',
      time: 'Hace 2 horas',
      content: '¡Completé mi entrenamiento de 45 minutos! 💪 Me siento increíble.',
      likes: 12,
      comments: 3,
      achievement: 'Entrenamiento completado'
    },
    {
      user: 'Carlos Ruiz',
      avatar: 'C',
      time: 'Hace 4 horas',
      content: 'Nueva receta saludable: ensalada de quinoa con aguacate 🥗',
      likes: 8,
      comments: 5,
      achievement: 'Comida saludable'
    },
    {
      user: 'Ana López',
      avatar: 'A',
      time: 'Hace 6 horas',
      content: '¡15 días seguidos registrando mis comidas! 🔥',
      likes: 20,
      comments: 7,
      achievement: 'Racha de 15 días'
    }
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        👥 Social
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Conecta con la comunidad FitLife y comparte tu progreso
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button variant="contained" startIcon={<Add />}>
          Crear Publicación
        </Button>
        <Button variant="outlined" startIcon={<People />}>
          Encontrar Amigos
        </Button>
      </Box>

      <Box sx={{ maxWidth: 600 }}>
        {posts.map((post, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                  {post.avatar}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {post.user}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {post.time}
                  </Typography>
                </Box>
                <Chip 
                  label={post.achievement} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                />
              </Box>

              <Typography variant="body1" sx={{ mb: 2 }}>
                {post.content}
              </Typography>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton size="small">
                    <FavoriteBorder />
                  </IconButton>
                  <Typography variant="body2">{post.likes}</Typography>
                  
                  <IconButton size="small">
                    <Comment />
                  </IconButton>
                  <Typography variant="body2">{post.comments}</Typography>
                </Box>

                <IconButton size="small">
                  <Share />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default SocialPage;