// @ts-nocheck
import axios from 'axios';
import { ChannelType, Client, IntentsBitField, Message } from 'discord.js';
import 'dotenv/config';
import { callGetSecret } from './secrets';

export const client = new Client({ intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.DirectMessages] });
const removeID = (inputString: string) => inputString.replace(/<@\d+>/g, '').trim();


const getChat = async (question: string, projectID: string): Promise<JSON | unknown> => {
  const DOCIT_AUTH = await callGetSecret('DOCIT_AUTH');
  const DOCIT_INFRA = await callGetSecret('DOCIT_INFRA');
  const getResponse = await axios.post(`${DOCIT_INFRA}/questions`,
    { question, projectID },
    {
      headers: { 'Content-Type': 'application/json' },
      auth: { username: 'admin', password: DOCIT_AUTH }
    }
  );
  return getResponse.data;
}

client.once('ready', () => {
  console.log(`Ready! Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  const { guildId, content, author } = message;
  const DISCORD_BOT_ID = await callGetSecret('DISCORD_BOT_ID');
  if (!content.length || author.bot || author.id === DISCORD_BOT_ID) return;

  const guild = client.guilds.cache.get(guildId);
  if (!guild) return;

  switch (guildId) {
    case '899867212309987378': // TODO: Move this to a db function to return valid variables here
      const response = await getChat(removeID(content), 'sui');

      const clean = JSON.parse(response.answer).choices[0].message.content.replace(/\n/g, " ")

      // Check if the message is in a thread
      if (message.position) {
        message.reply(clean);
      } else {
        // Send response in a new thread
        const threadChannel = await message.startThread({
          name: 'Response Thread',
          autoArchiveDuration: 1440, // Set the auto-archive duration as needed
          type: ChannelType.PrivateThread,
          startMessage: clean,
          reason: 'separate thread for documentation',
        });

        threadChannel.members.add(message.author);
        threadChannel.send(clean);
      }
      break;
  }
});

(async () => {
  const DISCORD_TOKEN = await callGetSecret('DISCORD_TOKEN');
  client.login(DISCORD_TOKEN)}
)();
