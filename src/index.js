require('dotenv').config();
const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

client.on("ready", () => {
    console.log("Bot is ready");
    client.user.setPresence({ activities: [{ name: "Rock, Paper, Scissors" }], type: "PLAYING" });

    const rps = new SlashCommandBuilder()
        .setName("rps")
        .setDescription("Rock, Paper, Scissors");
    client.application.commands.create(rps);
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === "rps") {
        const embed = new EmbedBuilder()
            .setTitle("Rock, Paper, Scissors")
            .setColor(0x00ffff)
            .setDescription("Choose your move!")
            .setFooter({ text: "Powered by Kyji" })
            .setTimestamp()
            .addFields(
                { name: "Rock", value: "✊", inline: true },
                { name: "Paper", value: "✋", inline: true },
                { name: "Scissors", value: "✌️", inline: true }
            );

        const message = await interaction.reply({ embeds: [embed], fetchReply: true });
        await message.react("✊");
        await message.react("✋");
        await message.react("✌️");

        const filter = (reaction, user) => ["✊", "✋", "✌️"].includes(reaction.emoji.name) && user.id === interaction.user.id;

        const choices = ["✊", "✋", "✌️"];
        const computerChoice = choices[Math.floor(Math.random() * choices.length)];
        
        // menunggu 10 detik untuk mengeluarkan hasil
        message.awaitReactions({ filter, time: 10000 }).then(async (collected) => {
            const reaction = collected.first();
        
            if (!reaction) {
                const noReactionResult = new EmbedBuilder()
                    .setTitle("Rock, Paper, Scissors")
                    .setDescription("No reaction was collected within the time limit.")
                    .setFooter({ text: "Powered by Kyji" })
                    .setTimestamp();
        
                return interaction.editReply({ embeds: [noReactionResult], fetchReply: true });
            }
        
            const result = new EmbedBuilder()
                .setTitle("Rock, Paper, Scissors")
                .addFields(
                    { name: "You", value: reaction.emoji.name, inline: true },
                    { name: "Computer", value: computerChoice, inline: true }
                )
                .setFooter({ text: "Powered by Kyji" })
                .setTimestamp();
        
                
                if (reaction.emoji.name === computerChoice) {
                    result.setDescription("Tie");
                } else if (
                    (reaction.emoji.name === "✊" && computerChoice === "✋") ||
                    (reaction.emoji.name === "✋" && computerChoice === "✌️") ||
                    (reaction.emoji.name === "✌️" && computerChoice === "✊")
                    ) {
                        result.setDescription("You lose");
                    } else {
                        result.setDescription("You win");
                    }
                    await interaction.editReply({ embeds: [result], fetchReply: true });
                    await message.reactions.removeAll();
        });
        
    }
});

client.login(process.env.TOKEN);
