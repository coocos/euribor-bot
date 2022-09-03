# euribor-bot

A simple Telegram bot which publishes 12 month Euribor rates once a day.

## How it works

The bot tracks the 12 month Euribor rate [published by the the Bank of Finland every day](https://www.suomenpankki.fi/WebForms/ReportViewerPage.aspx?report=/tilastot/markkina-_ja_hallinnolliset_korot/euribor_korot_today_xml_en&output=xml). When the rate is updated at around midday Finnish time, the bot sends it to all the channels it tracks.

Once the bot has been added to a channel, you need to send the `/euribor register` command so that the bot starts sending rates. If want to stop receiving rates, send `/euribor unregister`. You can also query the rate at any time with `/euribor rate`.

## Development

You can run the bot locally by installing the dependencies, setting [your bot token](https://core.telegram.org/bots/faq#how-do-i-create-a-bot) and then running `npm run dev`:

```bash
# Install dependencies
npm ci

# Export the token received from the Botfather
export TELEGRAM_BOT_TOKEN=your-token-goes-here

# Start the bot
npm run dev
```

Alternatively you can build the bot as a container and run it:

```bash
# Build the container image
docker build -t euribor-bot .

# Run the container and mount local database path to container
docker run --name euribor-bot --rm -d -v $(pwd)/data:/home/node/bot/data -e TELEGRAM_BOT_TOKEN=your-token-goes-here euribor-bot
```

The bot uses [LowDB](https://github.com/typicode/lowdb) to store the rate history, as well the channels it tracks. These database contents are written to `/data/db.json`.
