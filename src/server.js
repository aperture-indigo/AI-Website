const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/", (req, res) => {
  res.render("index", {
    company: {
      name: "Aperture Indigo",
      email: "info@apertureindigo.com",
      phone: "(555) 214-8700"
    },
    featured: [
      {
        index: "01",
        title: "Web Design, Development & Hosting",
        summary: "Design polished websites, build responsive front-end experiences, and keep hosting, domains, performance, and launch support aligned.",
        image: "/assets/services/orbit-mapping.png"
      },
      {
        index: "02",
        title: "Software Propulsion & Automation",
        summary: "Create internal tools, automate repetitive admin, and connect the systems your team already depends on so productivity keeps momentum.",
        image: "/assets/services/automation-propulsion.png"
      },
      {
        index: "03",
        title: "IT Mission Control",
        summary: "Bring structure to vendors, security basics, backups, device policy, and day-to-day support so the operational field stays stable.",
        image: "/assets/services/mission-control.png"
      },
      {
        index: "04",
        title: "Data Continuity Fields",
        summary: "Design backups, access patterns, and continuity plans that keep critical information resilient when systems shift under pressure.",
        image: "/assets/services/infrastructure-field.png"
      }
    ],
    capabilities: {
      design: [
        "Service architecture",
        "Workflow force mapping",
        "Tool selection",
        "Interface telemetry"
      ],
      build: [
        "Custom dashboards",
        "Internal portals",
        "Automation thrusters",
        "System integrations"
      ],
      operate: [
        "IT governance",
        "Vendor coordination",
        "Access control",
        "Continuity planning"
      ]
    },
    videos: [
      {
        title: "IT Entropy",
        creator: "Sylvain Gaussens",
        year: "2020",
        blurb: "A progression from order to collapse using entropic motion and stark digital texture.",
        video: "/photos/videos/IT%20Entropy.mp4"
      },
      {
        title: "Operational Noise",
        creator: "Daniel Sierra",
        year: "2013",
        blurb: "Houdini-driven abstract motion with clean oscillation, geometric rhythm, and a research-film feel.",
        video: "/photos/videos/Operational%20Noise.mp4"
      }
    ]
  });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
