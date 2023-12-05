// @ts-nocheck
import axios from 'axios';
import { ChannelType, Client, IntentsBitField, Message } from 'discord.js';
import 'dotenv/config';

const client = new Client({ intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.DirectMessages] });
const removeID = (inputString: string) => inputString.replace(/<@\d+>/g, '').trim();

const getChat = async (question: string, projectID: string): Promise<JSON | unknown> => {
  const getResponse = await axios.get(`${process.env.DOCIT_INFRA}/questions`, { data: { question, projectID }, auth: { username: 'admin', password: process.env.DOCIT_AUTH } });

  return getResponse.data;
}

client.once('ready', () => {
  console.log(`Ready! Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  const { guildId, content, author } = message;
  if (!content.length || author.bot || author.id === process.env.DISCORD_BOT_ID) return;

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

client.login(process.env.DISCORD_TOKEN);

//TODO: Guild = server. Create a map of each guild to route calls for specified blockchain or project :-)