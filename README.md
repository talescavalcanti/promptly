# Promptly - Advanced AI Prompt Builder

**Promptly** is a professional tool designed for developers and product managers to generate high-quality, technically detailed prompts for AI coding assistants (like Lovable, GPT-Engineer, v0, and Google AI Studio).

It leverages **Google's Gemini AI** to transform simple descriptions into comprehensive architectural specifications, saving hours of planning and documentation time.

![Promptly Dashboard](/public/hero-image.png)

## 🚀 Key Features

### 🛠️ Prompt Builders
- **SaaS Builder**: Create full-stack project specifications (Frontend, Backend, Database, Auth) for new SaaS applications.
- **Landing Page Builder**: Generate high-conversion landing page copy and structure with "Portfolio" or "Custom" modes.
- **Feature Builder**: Define technical specifications for specific features (e.g., "Add Stripe Subscription", "Implement Two-Factor Auth") with varying levels of robustness (Fast, Secure, Bulletproof).

### ⚡ Core Functionality
- **Dashboard**: Central hub to manage your recent activity and credits.
- **Project Management**: Save, edit, and organize your generated prompts.
- **Copy as Code**: One-click export of prompts optimized for different AI platforms.
- **Showcase**: Community gallery of effective prompts (Coming Soon).

### 💎 Subscription & Limits
- **Free Tier**: 5 generations to test the power of Promptly.
- **Pro & Enterprise**: Higher limits for power users.
- **Secure Payments**: Integrated with **Asaas** for Pix and Credit Card processing.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + CSS Modules
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **AI**: [Google Gemini Pro](https://deepmind.google/technologies/gemini/) (via `google-generative-ai`)
- **Payments**: Asaas API

---

## 🏁 Getting Started

### Prerequisites

1. **Node.js**: Version 18+ recommended.
2. **Supabase Account**: You need a project for Auth and Database.
3. **Google AI Studio Key**: Get a Gemini API key.
4. **Asaas Account**: (Optional) For payment processing integration.

### Environment Setup

Create a `.env.local` file in the root directory:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Asaas Payments (Optional for local dev)
ASAAS_API_KEY=your_asaas_api_key
ASAAS_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/promptly.git
   cd promptly
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 Usage Guide

### 1. Generating a SaaS Project
1. Navigate to **/builder**.
2. Enter your **App Name** and **Niche** (e.g., "CRM for Dentists").
3. Select your preferred **Tech Stack** and **Visual Style**.
4. Click **Generate**.
5. Copy the output and paste it into Lovable, ChatGPT, or your preferred coding agent.

### 2. Creating a Landing Page
1. Go to **/landing-builder**.
2. Choose **Portfolio Mode** (for personal sites) or **Custom Mode** (for products).
3. Define your target audience and tone of voice.
4. Generate the prompt to get a conversion-optimized structure.

### 3. Specifying a Feature
1. Access **/feature-builder**.
2. Select the context: **Frontend**, **Backend**, **Database**, or **Auth**.
3. Choose the **Robustness Level**:
   - *Fast*: Basic validation, good for prototypes.
   - *Secure*: Standard production practices.
   - *Bulletproof*: Exhaustive validation and security checks.
4. Describe the feature (e.g., "User profile upload with resizing").
5. Generate a technical spec ready for implementation.

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
