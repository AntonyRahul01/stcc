// Data service to manage news, events, and upcoming events
// Uses localStorage to persist data

const STORAGE_KEYS = {
  NEWS: 'stcc_news_data',
  EVENTS: 'stcc_events_data',
  UPCOMING: 'stcc_upcoming_events_data',
};

// Get all data (news + events combined) - for frontend components
export const getAllData = () => {
  const news = getNews();
  const events = getEvents();
  return [...news, ...events];
};

// Initialize data from imports or localStorage
export const initializeData = (importedNewsData, importedUpcomingEvents) => {
  // Initialize news data
  if (!localStorage.getItem(STORAGE_KEYS.NEWS)) {
    const newsItems = importedNewsData.filter(item => item.type === 'news');
    localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(newsItems));
  }

  // Initialize events data
  if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
    const eventItems = importedNewsData.filter(item => item.type === 'events');
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(eventItems));
  }

  // Initialize upcoming events data
  if (!localStorage.getItem(STORAGE_KEYS.UPCOMING)) {
    localStorage.setItem(STORAGE_KEYS.UPCOMING, JSON.stringify(importedUpcomingEvents || []));
  }
};

// News operations
export const getNews = () => {
  const data = localStorage.getItem(STORAGE_KEYS.NEWS);
  return data ? JSON.parse(data) : [];
};

export const saveNews = (news) => {
  localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(news));
};

export const addNews = (newsItem) => {
  const news = getNews();
  const newId = news.length > 0 ? Math.max(...news.map(n => n.id)) + 1 : 1;
  const newNews = { ...newsItem, id: newId };
  news.push(newNews);
  saveNews(news);
  return newNews;
};

export const updateNews = (id, updatedNews) => {
  const news = getNews();
  const index = news.findIndex(n => n.id === id);
  if (index !== -1) {
    news[index] = { ...news[index], ...updatedNews };
    saveNews(news);
    return news[index];
  }
  return null;
};

export const deleteNews = (id) => {
  const news = getNews();
  const filtered = news.filter(n => n.id !== id);
  saveNews(filtered);
  return filtered;
};

// Events operations
export const getEvents = () => {
  const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
  return data ? JSON.parse(data) : [];
};

export const saveEvents = (events) => {
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
};

export const addEvent = (eventItem) => {
  const events = getEvents();
  const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
  const newEvent = { ...eventItem, id: newId };
  events.push(newEvent);
  saveEvents(events);
  return newEvent;
};

export const updateEvent = (id, updatedEvent) => {
  const events = getEvents();
  const index = events.findIndex(e => e.id === id);
  if (index !== -1) {
    events[index] = { ...events[index], ...updatedEvent };
    saveEvents(events);
    return events[index];
  }
  return null;
};

export const deleteEvent = (id) => {
  const events = getEvents();
  const filtered = events.filter(e => e.id !== id);
  saveEvents(filtered);
  return filtered;
};

// Upcoming Events operations
export const getUpcomingEvents = () => {
  const data = localStorage.getItem(STORAGE_KEYS.UPCOMING);
  return data ? JSON.parse(data) : [];
};

export const saveUpcomingEvents = (events) => {
  localStorage.setItem(STORAGE_KEYS.UPCOMING, JSON.stringify(events));
};

export const addUpcomingEvent = (eventItem) => {
  const events = getUpcomingEvents();
  const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
  const newEvent = { ...eventItem, id: newId };
  events.push(newEvent);
  saveUpcomingEvents(events);
  return newEvent;
};

export const updateUpcomingEvent = (id, updatedEvent) => {
  const events = getUpcomingEvents();
  const index = events.findIndex(e => e.id === id);
  if (index !== -1) {
    events[index] = { ...events[index], ...updatedEvent };
    saveUpcomingEvents(events);
    return events[index];
  }
  return null;
};

export const deleteUpcomingEvent = (id) => {
  const events = getUpcomingEvents();
  const filtered = events.filter(e => e.id !== id);
  saveUpcomingEvents(filtered);
  return filtered;
};

