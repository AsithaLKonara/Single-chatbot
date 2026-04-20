# 🚀 Final Setup Guide — Business Automation Agent

Follow these steps to fully activate your upgraded chatbot across WhatsApp, WooCommerce, and the Admin Panel.

---

## 1. 🔑 Configure Environment Variables

Open your `.env.local` file and ensure all the following variables are correctly filled. You can use the `.env.example` as a template.

### AI & Core
*   `GROQ_API_KEY`: Get this from the [Groq Console](https://console.groq.com/keys).

### WhatsApp (Meta Developer Portal)
*   `WHATSAPP_TOKEN`: Your Permanent Access Token.
*   `WHATSAPP_PHONE_NUMBER_ID`: Found in your Meta WhatsApp Dashboard.
*   `WHATSAPP_VERIFY_TOKEN`: A secret string of your choice (e.g., `omnichat_verify_2024`).
*   `WHATSAPP_APP_SECRET`: Found in Settings > Basic of your Meta App.

### WooCommerce
*   `WC_STORE_URL`: Your store URL (e.g., `https://mystore.com`).
*   `WC_CONSUMER_KEY`: Generated in WooCommerce > Settings > Advanced > REST API.
*   `WC_CONSUMER_SECRET`: Generated alongside the Consumer Key.

### Upstash (Redis)
*   `UPSTASH_REDIS_REST_URL`: From your [Upstash Console](https://console.upstash.com/).
*   `UPSTASH_REDIS_REST_TOKEN`: From your Upstash Console.

---

## 2. 🗄️ Database Migration

The upgrade introduced a new `Customer` model for smart memory and personalization. You must sync this with your Supabase database.

Run the following command in your terminal:

```bash
npx prisma db push
```

*This will update your database schema without losing existing data.*

---

## 3. 🔗 Webhook Setup (WhatsApp)

To receive messages from customers on WhatsApp, you must connect your Meta App to your server.

1.  **Deploy your app**: Ensure your Next.js app is deployed (e.g., to Vercel).
2.  **Meta Dashboard**: Go to your [Meta Developer Portal](https://developers.facebook.com/).
3.  **WhatsApp Settings**: Navigate to **WhatsApp > Configuration**.
4.  **Callback URL**: Set it to `https://your-domain.com/api/webhooks/whatsapp`.
5.  **Verify Token**: Enter the same string you used in `WHATSAPP_VERIFY_TOKEN`.
6.  **Webhook Fields**: Under "Webhooks", click **Manage** and subscribe to `messages`.

---

## 4. 🤖 Automation Setup (Cron Jobs)

The proactive automation (delivery follow-ups, re-order nudges) requires a trigger.

### On Vercel:
Vercel will automatically detect the `/api/automation` route. You can trigger it manually via Postman or set up a Cron Job in your `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/automation",
    "schedule": "0 9 * * *"
  }]
}
```

---

## 5. 📊 Accessing the Admin Panel

Your new premium dashboard is ready at:

**`https://your-domain.com/admin/dashboard`**

### Recommended Initial Actions:
1.  **Add Knowledge**: Go to the **Knowledge Base** tab and add your store's Shipping Policy and Return Policy. This ensures the AI answers these questions accurately via RAG.
2.  **Monitor Conversations**: Use the **Conversations** tab to see how the bot is interacting with WhatsApp users in real-time.

---

## 🧪 Testing the Flow

1.  **WhatsApp**: Send "Hi" to your registered business number.
2.  **Intent Check**: Ask "Do you have any Nike shoes?" (The bot should search WooCommerce).
3.  **Tracking Check**: Ask "Where is my order #1234?" (The bot should check WooCommerce and then the Courier API).
