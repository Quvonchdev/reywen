const { Telegraf } = require('telegraf');
const envSecretsConfig = require('../configurations/env-secrets-config');

const bot = new Telegraf(envSecretsConfig.TELEGRAM_BOT_TOKEN);

exports.bot = bot;
