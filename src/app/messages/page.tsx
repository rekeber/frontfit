'use client';

import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Avatar, 
  Badge,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Button
} from '@mui/material';
import { 
  Message, 
  Add, 
  Circle 
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';

const MessagesPage: React.FC = () => {
  const conversations = [
    {
      name: 'Entrenador Personal',
      lastMessage: 'Recuerda hacer tu rutina de cardio hoy',
      time: '10:30 AM',
      unread: 2,
      avatar: 'E',
      online: true
    },
    {
      name: 'Nutricionista',
      lastMessage: 'Tu plan de alimentación está listo',
      time: 'Ayer',
      unread: 0,
      avatar: 'N',
      online: false
    },
    {
      name: 'Grupo FitLife',
      lastMessage: 'María: ¡Gran entrenamiento hoy!',
      time: 'Ayer',
      unread: 5,
      avatar: 'G',
      online: true
    },
    {
      name: 'Dr. Salud',
      lastMessage: 'Tus resultados médicos están disponibles',
      time: '2 días',
      unread: 1,
      avatar: 'D',
      online: false
    }
  ];

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          💬 Mensajes
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Mantente conectado con tu equipo de salud y la comunidad
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button variant="contained" startIcon={<Add />}>
            Nueva Conversación
          </Button>
          <Button variant="outlined" startIcon={<Message />}>
            Mensajes Grupales
          </Button>
        </Box>

        <Card>
          <CardContent sx={{ p: 0 }}>
            <List>
              {conversations.map((conversation, index) => (
                <React.Fragment key={index}>
                  <ListItem 
                    sx={{ 
                      py: 2,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                          conversation.online ? (
                            <Circle sx={{ color: 'success.main', fontSize: 12 }} />
                          ) : null
                        }
                      >
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {conversation.avatar}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {conversation.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {conversation.time}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '200px'
                            }}
                          >
                            {conversation.lastMessage}
                          </Typography>
                          {conversation.unread > 0 && (
                            <Badge 
                              badgeContent={conversation.unread} 
                              color="primary"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < conversations.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>

        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              💡 Consejos de Comunicación
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • Mantén conversaciones regulares con tu entrenador personal
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • Comparte tu progreso con la comunidad para mayor motivación
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • No dudes en hacer preguntas a los profesionales de la salud
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </MainLayout>
  );
};

export default MessagesPage;