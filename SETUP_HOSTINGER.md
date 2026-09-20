# 🚀 Setup Guide for Hostinger

## 1. Create Database Tables

Execute the migration SQL to create the `site_content` and `notifications` tables.

### Option A: Using Hostinger Panel (Recommended)

1. Go to **Hostinger Control Panel**
2. Click **MySQL Databases**
3. Click **Manage** for your database (u128759105_Catia)
4. Click **phpMyAdmin**
5. Select your database (u128759105_Catia)
6. Go to **Import** tab
7. Copy the content from `migrations/002_add_content_and_notifications.sql`
8. Paste into the SQL textarea
9. Click **Go**

### Option B: Using SSH + MySQL CLI

```bash
ssh -p 65002 -i ~/.ssh/marcuscatia_hostinger u128759105@72.60.93.207

# Navigate to project
cd ~/domains/lightskyblue-bat-697565.hostingersite.com/hbuilds/last-source

# Execute migration
mysql -u u128759105_Marcuscatia -p u128759105_Catia < migrations/002_add_content_and_notifications.sql
# Password: f5Zy*2M@
```

## 2. Update Environment Variables

Ensure your `.env.production.local` includes:

```env
DB_HOST=72.60.93.207
DB_USER=u128759105_Marcuscatia
DB_PASSWORD=f5Zy*2M@
DB_NAME=u128759105_Catia
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

## 3. Deploy to Hostinger

After running migrations, push changes:

```bash
git push origin main
```

Then in SSH:

```bash
cd ~/domains/lightskyblue-bat-697565.hostingersite.com/hbuilds/last-source
git pull origin main
npm run build
npm run start
```

## 4. Verify Installation

Check that tables were created:

```sql
SELECT * FROM site_content LIMIT 1;
SELECT * FROM notifications LIMIT 1;
```

## Admin Features Now Available

✅ **Content Editor Tab** - Edit FAQs, testimonials, hero text
✅ **Settings Tab** - Upload new logo, manage site info
✅ **Logo Upload** - Drag & drop logo replacement
✅ **WhatsApp Notifications** - Automatic booking confirmations

---

**Questions?** Check the audit report at AUDITORIA_COMPLETA.md
