// @ts-nocheck
import axios from 'axios';
import { ChannelType, Client, IntentsBitField } from 'discord.js';
import 'dotenv/config';
import { callGetSecret } from './secrets';

export const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.MessageContent
  ]
});

const removeID = (inputString: string) => inputString.replace(/<@\d+>/g, '').trim();

const getChat = async (question: string, projectID: string): Promise<JSON | unknown> => {
  const DOCIT_AUTH = await callGetSecret('DOCIT_AUTH');
  const DOCIT_INFRA = await callGetSecret('DOCIT_INFRA');
  const response = await axios.post(`${DOCIT_INFRA}/questions`,
    { question, projectID },
    {
      headers: { 'Content-Type': 'application/json' },
      auth: { username: 'admin', password: DOCIT_AUTH }
    }
  );
  return response.data;
};

client.once('ready', () => {
  console.log(`Ready! Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  const { content, author } = message;
  const DISCORD_BOT_ID = await callGetSecret('DISCORD_BOT_ID');

  if (!content.length || author.bot || author.id === DISCORD_BOT_ID) return;

  let modifiedContent = content;

  // Check if the content string does not contain 'in SUI', and append it if necessary
  // if (!content.includes('in SUI')) {
  //   modifiedContent = `${content} in SUI`;
  // }

  const response = await getChat(removeID(modifiedContent), 'sui');
  if (!response || typeof response.answer !== 'string') return;

  const getAnswer = JSON.parse(response.answer).choices[0].message.content.replace(/\n/g, " ");

  // Check for direct mention and unknown answer
  if (message.mentions.members.find(m => m.id === DISCORD_BOT_ID) && getAnswer.trim() === "Sorry, I don't know how to help with that.") {
    message.reply(getAnswer);
    return;
  } else if (getAnswer.trim() === "Sorry, I don't know how to help with that.") {
    return; // Do not send back a response
  }

  // Check if the message is part of a thread
  const isThreadMessage = message.channel.type === ChannelType.PublicThread || message.channel.type === ChannelType.PrivateThread;

  if (isThreadMessage) {
    // Reply in the current thread
    message.reply(getAnswer);
  } else {
    // Send response in a new thread
    const threadChannel = await message.startThread({
      name: 'Response Thread',
      autoArchiveDuration: 1440,
      type: ChannelType.PrivateThread,
      startMessage: getAnswer,
      reason: 'separate thread for documentation',
    });

    threadChannel.members.add(message.author);
    threadChannel.send(getAnswer);
  }
});

(async () => {
  const DISCORD_TOKEN = await callGetSecret('DISCORD_TOKEN');
  client.login(DISCORD_TOKEN);
})();
