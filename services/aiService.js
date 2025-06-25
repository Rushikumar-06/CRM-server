require('dotenv').config();
const { OpenAI } = require('openai');
const Contact = require('../models/Contact');
const Tag = require('../models/Tag');
const ActivityLog = require('../models/ActivityLog');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function fetchCRMData(userId) {
  const [contacts, tags, activities] = await Promise.all([
    Contact.find({ userId }).lean(),
    Tag.find({ userId }).lean(),
    ActivityLog.find({ userId }).sort({ timestamp: -1 }).limit(10).lean(),
  ]);

  return {
    contactsSummary: `Total: ${contacts.length}, First contact: ${contacts[0]?.name || 'N/A'}`,
    tagsSummary: tags.map(tag => `${tag.name} (${tag.color})`).join(', ') || 'No tags',
    recentActivities: activities.map(act => `- ${act.action} ${act.entityType} at ${new Date(act.timestamp).toLocaleString()}`).join('\n') || 'No recent activities',
  };
}

async function processWithAI(message, userId) {
  const crmData = await fetchCRMData(userId);

  const systemPrompt = `
You are an intelligent AI assistant integrated into a custom-built CRM. The CRM includes:
- Contacts (with fields like name, company, tags)
- Tags (colored labels assigned to contacts)
- Activity logs (recording user actions like adding/deleting contacts or tags)
- Dashboard summaries (showing stats like total contacts, recent activity, tag usage)

Here is the current user data:
- Contacts Summary: ${crmData.contactsSummary}
- Tags Summary: ${crmData.tagsSummary}
- Recent Activities:\n${crmData.recentActivities}

Answer the user's questions about their CRM, project logic, features, and current data.
`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ],
  });

  return completion.choices[0].message.content.trim();
}

module.exports = { processWithAI };
