# Team Access Guide — Share with 5 People

## Why localhost does not work for others

`http://localhost:5175` only works on **your PC**. Teammates need your **network IP address**.

---

## Step 1 — One-time firewall setup (Administrator)

1. Go to folder: `jira-dashboard\scripts\`
2. **Right-click** `start-for-team.bat` → **Run as administrator**
3. Click **Yes** if Windows asks for permission
4. This opens port **5175** in Windows Firewall

---

## Step 2 — Start the dashboard

Keep this running while your team uses it:

```powershell
cd "C:\Users\u1198198\OneDrive - IQVIA\Desktop\OA TESTING\JIRA\jira-dashboard"
npm run dev
```

Or double-click `scripts\start-for-team.bat` (after Step 1).

---

## Step 3 — Share the team URL

In the dashboard, click **Share with Team** in the header.

Share one of these URLs with Adhesh, Darwin, Yashwanth, and others:

- **http://10.194.52.33:5175** (office network)
- **http://172.20.10.2:5175** (if on VPN/hotspot — try if first fails)

---

## Requirements for all 5 teammates

| Requirement | Details |
|-------------|---------|
| Same network | IQVIA office LAN **or** connected to IQVIA VPN |
| Correct URL | Network IP above — **not** localhost |
| Your PC on | Dashboard must stay running on your machine |
| Firewall | Step 1 completed once as Administrator |

---

## If still not working

1. Windows Search → **Windows Defender Firewall** → **Allow an app**
2. Find **Node.js** → check **Private** network
3. Or manually add inbound rule for TCP port **5175**
4. Ask IT if corporate policy blocks peer-to-peer connections on your subnet

---

## Alternative (if LAN sharing is blocked by IT)

Ask IT to host the dashboard on an internal server, or deploy to a shared IQVIA machine that all 5 QA members can reach.
