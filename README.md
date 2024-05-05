# InstaStalk Lite

A Puppeteer-based tool to track Instagram Reels liked by specific users you follow.

## 🚀 Features

- Track Reels liked by specific Instagram users
- Automated Instagram login
- Scroll through Reels feed
- Save results to JSON
- Configurable scanning intervals

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm
- Instagram account credentials

## 🛠️ Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/instastalk-lite.git
cd instastalk-lite
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your Instagram credentials:
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. Run the script:
```bash
node main.js --target <username>
```

## ⚙️ Configuration

Create a `.env` file with the following variables:
```
IG_USERNAME=your_instagram_username
IG_PASSWORD=your_instagram_password
```

## 🔒 Privacy & Security

- This tool only tracks publicly visible likes
- Your Instagram credentials are stored locally
- Use responsibly and respect privacy

## ⚠️ Disclaimer

This tool is for educational purposes only. Use responsibly and in accordance with Instagram's terms of service. 