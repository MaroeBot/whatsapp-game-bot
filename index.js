const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

let currentQuestion = null;
let currentAnswer = null;

const questionsBank = [
    { q: 'ما هو الشيء الذي يكتب ولا يقرأ؟', a: 'القلم' },
    { q: 'ما هو الشيء الذي كلما زاد نقص؟', a: 'العمر' },
    { q: 'ما هو الشيء الذي يتحدث جميع اللغات؟', a: 'الصدى' }
];

const chooseBank = [
    'تأكل وجبة صراصير مشوية 🪳 أم تشرب عصير بصل وثوم؟ 🧅',
    'تعيش في جزيرة مهجورة لوحدك 🏝️ أم تعيش في بيت مسكون مع أشباح؟ 👻'
];

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('امسح الكود لتفعيل البوت');
});

client.on('ready', () => {
    console.log('🤖 بوت الألعاب جاهز!');
});

client.on('message', async (msg) => {
    const text = msg.body.trim().toLowerCase();

    if (text === '.الالعاب') {
        await msg.reply('🎮 *مرحباً بكم في بوت الألعاب!*\n\n📌 `.سؤال`\n📌 `.خيروك`');
        return;
    }

    if (text === '.سؤال') {
        if (currentQuestion) {
            await msg.reply(`❌ يوجد سؤال حالي:\n${currentQuestion}`);
            return;
        }

        const randomQ = questionsBank[Math.floor(Math.random() * questionsBank.length)];
        currentQuestion = randomQ.q;
        currentAnswer = randomQ.a;

        await client.sendMessage(msg.from, `❓ *سؤال للجميع:*\n\n${currentQuestion}`);
        return;
    }

    if (currentQuestion && text === currentAnswer.toLowerCase()) {
        const contact = await msg.getContact();

        await client.sendMessage(
            msg.from,
            `🎉 *إجابة صحيحة!*\n\nالفائز: @${contact.id.user} 🏆`,
            { mentions: [contact] }
        );

        currentQuestion = null;
        currentAnswer = null;
        return;
    }

    if (text === '.خيروك') {
        const randomChoice = chooseBank[Math.floor(Math.random() * chooseBank.length)];
        await client.sendMessage(msg.from, `🤔 *لو خيروك؟*\n\n${randomChoice}`);
    }
});

client.initialize();
