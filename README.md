<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&height=220&color=0:09090b,30:1a0505,65:450a0a,100:09090b&text=HACK-TO-WEEN&fontColor=ff3b3b&fontSize=55&fontAlignY=38&desc=ENTER%20IF%20YOU%20DARE&descAlignY=60&descSize=18&animation=fadeIn" width="100%" alt="Hack-To-Ween Horror Header"/>

### 🎃 AN IMMERSIVE 3D CLOUD HACKATHON EXPERIENCE 👻

**The gates are opening. The challenges are waiting. Will you survive?**

<br/>

[![Event](https://img.shields.io/badge/EVENT-HACK--TO--WEEN-8B0000?style=for-the-badge\&logo=ghost\&logoColor=white)](#)
[![Platform](https://img.shields.io/badge/PLATFORM-WEB--BASED-111827?style=for-the-badge\&logo=three.js\&logoColor=white)](#)
[![React](https://img.shields.io/badge/REACT-19-61DAFB?style=for-the-badge\&logo=react\&logoColor=black)](#)
[![Three.js](https://img.shields.io/badge/THREE.JS-3D-000000?style=for-the-badge\&logo=threedotjs\&logoColor=white)](#)
[![AWS](https://img.shields.io/badge/POWERED_BY-AWS-FF9900?style=for-the-badge\&logo=amazonaws\&logoColor=black)](#)

<br/>

**OCTOBER 31 – NOVEMBER 5, 2026**

**Registration Deadline:** October 30, 2026 | 11:59 PM IST

<br/>

**AWS SBG IITJ × AWS SBG GSMCOE**

*Organized by AWS Student Builder Groups, IIT Jodhpur, and GSMCOE.*

</div>

---

## ☠️ THE NIGHTMARE BEGINS

> *Beyond the iron gates lies a world of haunted code, mysterious cloud systems, and challenges waiting to be conquered.*
>
> **Hack-To-Ween** is an online, national flagship student-builder cloud hackathon built around an immersive 3D horror experience. Explore a haunted Victorian mansion, discover mysterious laboratories, enter four challenge chambers, and navigate the journey toward the final portal.

This is more than a conventional event website. It is a cinematic, scroll-driven experience designed to bring the Halloween atmosphere to life through procedural 3D environments, atmospheric lighting, interactive elements, and accessible web interfaces.

### 🕯️ WHAT AWAITS YOU?

* 🏚️ **Haunted Mansion:** Enter a gothic estate beneath a mysterious midnight moon.
* 👻 **Immersive 3D World:** Explore a procedural environment built with Three.js and React Three Fiber.
* ⚡ **Challenge Chambers:** Discover four domains: Generative AI, Cloud-Native, DevOps, and Open Innovation.
* 📜 **Event Chronicles:** Follow six milestones throughout the hackathon journey.
* ⚖️ **Judges' Chamber:** Explore the official 60-point evaluation framework.
* 🏆 **Prize Vault:** Discover the event's prize presentation area.
* 🤝 **Alliance Hall:** Celebrate the collaboration between AWS SBG IITJ and AWS SBG GSMCOE.
* 🌀 **Final Portal:** Reach the registration experience and integrated footer.

---

## 🦇 THE TECHNOLOGY BEHIND THE DARKNESS

<div align="center">

| Technology            | Purpose                                                 |
| :-------------------- | :------------------------------------------------------ |
| **React 19**          | Component-based user interface                          |
| **Vite**              | Fast development server and optimized production builds |
| **Three.js**          | Real-time 3D rendering                                  |
| **React Three Fiber** | Declarative Three.js scenes in React                    |
| **@react-three/drei** | Utilities for 3D scenes and camera interactions         |
| **GSAP**              | Animation and cinematic transitions                     |
| **Express.js**        | Backend API server                                      |
| **Zod**               | Request and data validation                             |
| **Vitest**            | Automated testing                                       |
| **Node.js**           | JavaScript runtime                                      |

</div>

---

## 🏚️ ENTER THE HAUNTED ESTATE

The experience is organized into eight spatial zones. Scrolling moves the camera through the environment, revealing new scenes as visitors progress through the website.

|  Zone  | Location               | Experience                                                                                     |
| :----: | :--------------------- | :--------------------------------------------------------------------------------------------- |
| **01** | Hero & Exterior Estate | Haunted mansion, glowing pumpkins, flickering windows, gnarled trees, and an opening iron gate |
| **02** | Mysterious Laboratory  | Floating server racks, LED blade servers, and geometric cloud nodes                            |
| **03** | Challenge Chambers     | Four interactive challenge domains                                                             |
| **04** | Event Chronicles       | A winding timeline with six milestone markers                                                  |
| **05** | Judges' Chamber        | Six pillars representing the evaluation criteria                                               |
| **06** | Prize Vault            | Trophy-inspired geometry and dramatic spotlights                                               |
| **07** | Alliance Hall          | Monumental stone arch featuring both organizing communities                                    |
| **08** | Final Portal           | Glowing torus gateway leading to registration and the footer                                   |

### 🌑 A CAMERA THAT FOLLOWS YOUR JOURNEY

The camera follows a smooth path generated with `CatmullRomCurve3`. Native scrolling drives movement through the scene, creating a continuous cinematic journey rather than a collection of disconnected sections.

The environment uses procedural geometry instead of relying on external 3D model downloads.

---

## 🕸️ ARCHITECTURE: TWO WORLDS, ONE EXPERIENCE

The application uses two complementary rendering layers.

### 1. The Persistent 3D World

The full-viewport Three.js canvas sits behind the interface.

**Key implementation details:**

* Fixed-position canvas covering the viewport.
* Procedurally generated mansion, graveyard, wrought-iron gate, pumpkins, ghosts, server racks, challenge pedestals, alliance arch, and final portal.
* Scroll-driven camera movement.
* Atmospheric lighting and particle effects.
* Interactive 3D elements where supported.
* Adaptive rendering quality for different devices.

### 2. The Accessible Interface

The foreground uses semantic HTML and CSS for all essential information and controls.

**Why this matters:**

* Event information remains readable and selectable.
* Forms and navigation do not depend on 3D rendering.
* Initial content can appear before the 3D experience finishes loading.
* The website can switch to a 2D fallback when WebGL is unavailable.
* Reduced-motion and low-graphics options help accommodate different users and devices.

### ⚡ PERFORMANCE-FIRST LOADING

The introductory page is separated from the main immersive experience.

* `/` loads the lightweight cinematic intro without mounting the main 3D canvas.
* `/hack` loads the full hackathon experience.
* The main 3D interface is code-split using `React.lazy()`.
* A poster background provides an initial visual fallback.
* The 3D experience crossfades into view after the first WebGL frame renders.

---

## 🧪 FOUR CHALLENGE CHAMBERS

The experience features four challenge domains designed around different areas of modern software and cloud engineering.

| Chamber | Domain          | Example Technologies                                            |
| :-----: | :-------------- | :-------------------------------------------------------------- |
|  **I**  | Generative AI   | Amazon Bedrock, foundation models, AI applications              |
|  **II** | Cloud-Native    | AWS Lambda, Amazon DynamoDB, AWS App Runner                     |
| **III** | DevOps          | AWS CDK, CI/CD pipelines, infrastructure automation             |
|  **IV** | Open Innovation | Event-driven systems, cloud architecture, emerging technologies |

These are examples of technologies suitable for the respective domains, not mandatory requirements for every submission.

Participants should follow the official challenge descriptions and submission instructions published by the organizers.

---

## ⚖️ THE JUDGES' CHAMBER

Every project is evaluated using the published **60-point judging rubric**.

| Evaluation Criterion               | Maximum Points |
| :--------------------------------- | :------------: |
| 🎃 Event Theme                     |       10       |
| ☁️ AWS Implementation / Deployment |       10       |
| 💡 Idea and Problem Statement      |       15       |
| 🎨 UI / UX                         |        5       |
| 📈 Business Model / Scale          |       10       |
| 💻 Codebase and README             |       10       |
| **TOTAL**                          |     **60**     |

### 🔍 WHAT THE JUDGES LOOK FOR

* **Event Theme:** Alignment with the hackathon objectives and relevance to the theme.
* **AWS Implementation / Deployment:** AWS integration, cloud architecture, serverless capabilities, and deployment.
* **Idea and Problem Statement:** Originality, problem clarity, potential impact, and solution effectiveness.
* **UI / UX:** Visual quality, accessibility, usability, navigation, and interface polish.
* **Business Model / Scale:** Market opportunity, viability, scalability, and practical application.
* **Codebase and README:** Code quality, repository organization, documentation, and reproducibility.

**Note:** The rubric above totals exactly 60 points. Refer to the official event documentation for final evaluation and submission requirements.

---

## 📅 EVENT CHRONICLES

**Event period:** October 31 – November 5, 2026

**Registration deadline:** October 30, 2026, at 11:59 PM IST

The website includes an interactive timeline with six milestone markers.

For exact phase dates, submission deadlines, announcements, and participation instructions, consult the official event timeline published by the organizers.

---

## 📂 PROJECT STRUCTURE

The following is a simplified overview of the principal application files and media assets.

```text
.
├── public/
│   └── assets/
│       └── videos/
│           ├── horror-intro.mp4
│           ├── joker-background.mp4
│           ├── horror-intro-poster.jpg
│           └── joker-background-poster.jpg
│
├── src/
│   ├── config/
│   │   └── media.js
│   ├── data/
│   │   └── rubric.js
│   ├── pages/
│   │   ├── Intro/
│   │   │   └── IntroPage.jsx
│   │   └── MainSite.jsx
│   └── ...
│
├── .env.example
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

*This is a representative structure, not an exhaustive listing of every file in the repository.*

### 🎬 MEDIA MANAGEMENT

Video and poster assets are centralized through `src/config/media.js`.

| Asset                         | Purpose                                       |
| :---------------------------- | :-------------------------------------------- |
| `horror-intro.mp4`            | Cinematic introduction                        |
| `joker-background.mp4`        | Background video for the immersive experience |
| `horror-intro-poster.jpg`     | Intro fallback image                          |
| `joker-background-poster.jpg` | Background video fallback image               |

Public asset URLs use `import.meta.env.BASE_URL` to support deployments at the root or a subdirectory.

Video playback is managed through the `useManagedVideo` and `ManagedVideo` utilities, which handle playback restrictions, visibility changes, low-graphics fallback, and decoder cleanup on unmount.

---

## 🚀 AWAKEN THE PROJECT LOCALLY

Ready to enter the mansion?

### Prerequisites

Install the following before starting:

* **Node.js:** 18.0.0 or later
* **npm:** 9.0.0 or later
* **Git:** A recent version

### Step 1: Clone the Repository

```bash
git clone <repo-url>
cd "AWS SBJ IITJ HACKATHON WEBSITE"
```

Replace `<repo-url>` with the actual Git repository URL.

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a local environment file from the example:

```bash
cp .env.example .env
```

On Windows PowerShell, you can use:

```powershell
Copy-Item .env.example .env
```

Update the variables as required by your local environment.

### Step 4: Start the Backend

Open a terminal and run:

```bash
npm run server
```

The backend is configured to use port `4000` by default.

### Step 5: Start the Frontend

Open a second terminal in the project directory:

```bash
npm run dev
```

The Vite development server runs on port `5173` by default.

### Step 6: Enter the Experience

Open the following address in your browser:

```text
http://localhost:5173
```

Visit `/hack` to access the main immersive experience directly.

**Troubleshooting:** If the frontend cannot reach the backend, verify that both servers are running and that the Vite `/api` proxy and backend port are configured correctly.

---

## ⚙️ AVAILABLE COMMANDS

| Command                | Description                                |
| :--------------------- | :----------------------------------------- |
| `npm run dev`          | Starts the Vite development server         |
| `npm run server`       | Starts the Express backend                 |
| `npm run build`        | Creates the production build               |
| `npm run preview`      | Previews the production build locally      |
| `npm run test`         | Runs the Vitest test suites                |
| `npm run check:links`  | Validates internal navigation targets      |
| `npm run check:launch` | Runs the project's launch-readiness checks |

Run these commands from the project root.

---

## 👁️ ADAPTIVE GRAPHICS SYSTEM

Not every visitor has a high-end GPU. The experience adjusts rendering quality based on device capabilities.

| Setting          |              High              |          Medium         |           Low          |
| :--------------- | :----------------------------: | :---------------------: | :--------------------: |
| Device target    |             Desktop            |     Tablet / Laptop     |  Mobile / Low Graphics |
| Pixel ratio cap  |               2.0              |           1.5           |           1.0          |
| Lighting         | Full lighting and point lights | Directional and ambient | Ambient and hemisphere |
| Embers           |               140              |            70           |           35           |
| Fireflies        |               45               |            24           |           12           |
| Ghosts           |                5               |            3            |            2           |
| Mansion geometry |           Full detail          |         Reduced         |       Simplified       |

Visitors can also enable **Low 3D** or **Reduced Motion** using the controls in the top navigation bar.

The goal is to preserve the atmosphere while making the experience more practical across different hardware configurations.

---

## 🛡️ SECURITY & ENVIRONMENT VARIABLES

The backend uses environment variables for configuration.

| Variable          | Purpose                      | Default                 |
| :---------------- | :--------------------------- | :---------------------- |
| `NODE_ENV`        | Runtime environment          | `development`           |
| `PORT`            | Backend port                 | `4000`                  |
| `ALLOWED_ORIGINS` | Allowed CORS origins         | `http://localhost:5173` |
| `DATABASE_URL`    | PostgreSQL connection string | Optional in memory mode |
| `SESSION_SECRET`  | Session-management secret    | Development placeholder |

### SECURITY CHECKLIST

* Keep `.env` out of version control.
* Never commit AWS access keys, passwords, session secrets, or private keys.
* Use `.env.example` for non-sensitive configuration examples.
* Configure production secrets using the hosting platform's secret-management facilities.
* Restrict CORS to trusted origins.
* Validate incoming requests on the backend.
* Review authentication, session management, and database access before deployment.

The application includes backend checks intended to reject submissions containing AWS access keys or private-key blocks. These checks are a supplementary safeguard, not a replacement for comprehensive secret scanning and secure handling.

**Never publish real credentials in the README, source code, screenshots, or issue reports.**

---

## 🧛 ROUTES & NAVIGATION

| Route        | Description                                  |
| :----------- | :------------------------------------------- |
| `/`          | Lightweight cinematic horror introduction    |
| `/hack`      | Main immersive hackathon website             |
| `/#gate`     | Legacy anchor redirected to `/hack#gate`     |
| `/#chambers` | Legacy anchor redirected to `/hack#chambers` |

The introduction route avoids mounting the main WebGL experience. Visitors enter the immersive site through the main call to action or by navigating directly to `/hack`.

Legacy hash navigation is handled through `history.replaceState` to preserve the intended destination.

---

## 🤝 THE ALLIANCE

<div align="center">

### AWS SBG IITJ × AWS SBG GSMCOE

**Two communities. One mission. Countless possibilities.**

Hack-To-Ween brings together student builders for a collaborative cloud hackathon focused on experimentation, innovation, and practical engineering.

</div>

---

## 📜 LEGAL NOTICE

Hack-To-Ween is organized by the student builder communities **AWS SBG IITJ** and **AWS SBG GSMCOE**, associated with IIT Jodhpur and Genba Sopanrao Moze College of Engineering.

AWS and Amazon Web Services are trademarks of Amazon.com, Inc. or its affiliates.

This is an independent academic community initiative. The use of AWS names or trademarks does not, by itself, imply official sponsorship or endorsement by Amazon Web Services.

Privacy and Terms documents supplied with the website are initial drafts and should be reviewed by appropriate legal representatives before full-scale public deployment.

---

## 🕯️ FINAL TRANSMISSION

<div align="center">

### THE GATES ARE OPENING...

**Build something extraordinary. Solve real problems. Make your mark.**

The clock is ticking.

The challenges are waiting.

**Will your project survive the night?**

<br/>

[![Hack-To-Ween](https://img.shields.io/badge/ENTER_THE_HACK-HACK--TO--WEEN-8B0000?style=for-the-badge\&logo=ghost\&logoColor=white)](#)

<br/>

*Designed for the builders who dare to innovate.*

<img src="https://capsule-render.vercel.app/api?type=waving&height=120&color=0:09090b,40:450a0a,100:09090b&section=footer" width="100%" alt="Horror Footer"/>

</div>
