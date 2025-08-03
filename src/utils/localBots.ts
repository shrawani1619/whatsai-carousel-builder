const BOTS_STORAGE_KEY = 'whatsapp_bots';

export interface LocalBot {
  id: string;
  project_name: string;
  user_id: string;
  description: string;
  status: 'Active' | 'Inactive' | 'Draft';
  created_at: string;
  updated_at?: string;
  verify_token?: string;
  config?: {
    model_name?: string;
    sub_model_name?: string;
    api_key?: string;
    whatsapp_access_token?: string;
    phone_number_id?: string;
    phone_number?: string;
  };
}

export const getBots = (): LocalBot[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(BOTS_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const getBot = (id: string): LocalBot | undefined => {
  const bots = getBots();
  return bots.find(bot => bot.id === id);
};

export const saveBot = (bot: Omit<LocalBot, 'id' | 'created_at' | 'status'> & { id?: string }): LocalBot => {
  const bots = getBots();
  const now = new Date().toISOString();
  
  if (bot.id) {
    // Update existing bot
    const index = bots.findIndex(b => b.id === bot.id);
    if (index !== -1) {
      bots[index] = { 
        ...bots[index], 
        ...bot,
        updated_at: now
      };
      localStorage.setItem(BOTS_STORAGE_KEY, JSON.stringify(bots));
      return bots[index];
    }
  }
  
  // Create new bot
  const newBot: LocalBot = {
    ...bot,
    id: bot.id || `bot-${Date.now()}`,
    created_at: now,
    status: 'Draft'
  };
  
  localStorage.setItem(BOTS_STORAGE_KEY, JSON.stringify([...bots, newBot]));
  return newBot;
};

export const deleteBot = (id: string): boolean => {
  const bots = getBots();
  const newBots = bots.filter(bot => bot.id !== id);
  if (newBots.length < bots.length) {
    localStorage.setItem(BOTS_STORAGE_KEY, JSON.stringify(newBots));
    return true;
  }
  return false;
};
