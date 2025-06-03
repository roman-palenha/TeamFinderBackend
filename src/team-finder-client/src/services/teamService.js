import axios from 'axios';

const API_URL = 'http://localhost:5241/api/teams';


const logRequest = (type, url, data = null) => {
  console.log(`[TeamService] ${type} request to: ${url}`);
  if (data) {
    console.log('[TeamService] Request data:', data);
  }
};


export const getTeams = async (filters = {}) => {
  try {
    const { game, platform, skillLevel } = filters;
    
    let url = API_URL;
    const params = new URLSearchParams();
    
    if (game) params.append('game', game);
    if (platform) params.append('platform', platform);
    if (skillLevel) params.append('skillLevel', skillLevel);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    logRequest('GET', url);
    const response = await axios.get(url);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching teams:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch teams. Please try again.' 
    };
  }
};

export const getTeamById = async (id) => {
  try {
    logRequest('GET', `${API_URL}/${id}`);
    const response = await axios.get(`${API_URL}/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`Error fetching team ${id}:`, error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch team details. Please try again.'
    };
  }
};


export const createTeam = async (teamData) => {
  try {

    if (!teamData.ownerId) {
      console.error('Owner ID is missing from team data');
      return {
        success: false,
        error: 'Owner ID is required. Please log out and log back in.'
      };
    }
    
    logRequest('POST', API_URL, teamData);
    const response = await axios.post(API_URL, teamData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error creating team:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create team. Please try again.'
    };
  }
};

export const joinTeam = async (teamId, userData) => {
  try {
    logRequest('POST', `${API_URL}/${teamId}/join`, userData);
    const response = await axios.post(`${API_URL}/${teamId}/join`, userData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`Error joining team ${teamId}:`, error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to join team. Please try again.'
    };
  }
};


export const leaveTeam = async (teamId, userId) => {
  try {
    logRequest('POST', `${API_URL}/${teamId}/leave`, { userId });
    const response = await axios.post(`${API_URL}/${teamId}/leave`, { userId });
    return { success: true };
  } catch (error) {
    console.error(`Error leaving team ${teamId}:`, error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to leave team. Please try again.'
    };
  }
};


export const deleteTeam = async (teamId, userId) => {
  try {
    logRequest('DELETE', `${API_URL}/${teamId}?userId=${userId}`);
    const response = await axios.delete(`${API_URL}/${teamId}?userId=${userId}`);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting team ${teamId}:`, error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete team. Please try again.'
    };
  }
};

export const matchTeams = async (criteria) => {
  try {
    logRequest('POST', `${API_URL}/match`, criteria);
    const response = await axios.post(`${API_URL}/match`, criteria);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error matching teams:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to find matching teams. Please try again.'
    };
  }
};