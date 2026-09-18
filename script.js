(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme toggle ---------- */
  var root = document.documentElement;
  var themeBtn = document.getElementById("themeToggle");
  var THEME_KEY = "blog-theme-pref";

  function applyThemeLabel(pref) {
    themeBtn.textContent = "--theme=" + pref;
  }

  function getStoredTheme() {
    try {
      return window.localStorage.getItem(THEME_KEY);
    } catch (e) {
      return null;
    }
  }

  function storeTheme(v) {
    try {
      window.localStorage.setItem(THEME_KEY, v);
    } catch (e) { /* storage unavailable, ignore */ }
  }

  var stored = getStoredTheme();
  if (stored === "light" || stored === "dark") {
    root.setAttribute("data-theme", stored);
    applyThemeLabel(stored);
  } else {
    applyThemeLabel("auto");
  }

  themeBtn.addEventListener("click", function () {
    var current = root.getAttribute("data-theme");
    var next;
    if (current === "dark") next = "light";
    else if (current === "light") next = null; // back to auto
    else next = "dark";

    if (next) {
      root.setAttribute("data-theme", next);
      storeTheme(next);
      applyThemeLabel(next);
    } else {
      root.removeAttribute("data-theme");
      storeTheme("");
      applyThemeLabel("auto");
    }
  });

  /* ---------- Terminal typewriter ---------- */
  var termBody = document.getElementById("termBody");
  var lines = [
    { type: "prompt", text: "whoami" },
    { type: "out", text: "Daniyal Dianati — software engineer" },
    { type: "prompt", text: "cat interests.txt" },
    { type: "out", text: "large language models, game development, teaching myself things badly first" }
  ];

  function renderStatic() {
    var html = "";
    lines.forEach(function (l) {
      if (l.type === "prompt") {
        html += '<div><span class="prompt">guest@site:~$</span> ' + l.text + "</div>";
      } else {
        html += '<div class="out">' + l.text + "</div>";
      }
    });
    html += '<div><span class="prompt">guest@site:~$</span> <span class="cursor"></span></div>';
    termBody.innerHTML = html;
  }

  function typewrite() {
    var lineEls = [];
    var container = document.createDocumentFragment();
    lines.forEach(function () {
      var d = document.createElement("div");
      lineEls.push(d);
      container.appendChild(d);
    });
    termBody.appendChild(container);

    var li = 0;
    function typeLine() {
      if (li >= lines.length) {
        var final = document.createElement("div");
        final.innerHTML = '<span class="prompt">guest@site:~$</span> <span class="cursor"></span>';
        termBody.appendChild(final);
        return;
      }
      var l = lines[li];
      var el = lineEls[li];
      var prefix = l.type === "prompt" ? '<span class="prompt">guest@site:~$</span> ' : '<span class="out">';
      var suffix = l.type === "prompt" ? "" : "</span>";
      var i = 0;
      function step() {
        if (i <= l.text.length) {
          el.innerHTML = prefix + l.text.slice(0, i) + suffix;
          i++;
          setTimeout(step, 14);
        } else {
          li++;
          setTimeout(typeLine, 220);
        }
      }
      step();
    }
    typeLine();
  }

  if (reduceMotion) {
    renderStatic();
  } else {
    typewrite();
  }

  /* ---------- Writing / git log ---------- */
  var posts = [
    {
      hash: "3f9a1c2",
      msg: "Learning to think in tokens",
      date: "Sep 2026",
      excerpt: "Building tokenviz forced me to actually sit with how models read text, instead of nodding along to the explanation. Notes on what surprised me, and the diagram that finally made it click."
    },
    {
      hash: "7b1d44a",
      msg: "Why I still make small, unfinished games",
      date: "Aug 2026",
      excerpt: "None of my games ship. That used to bother me. Now I think of pixel-forge as a testbed for taste — a place to feel bad code before it reaches anything that matters."
    },
    {
      hash: "a02e91f",
      msg: "Reading papers like a student again",
      date: "Jul 2026",
      excerpt: "Two years out of my master's, going back to primary sources on attention and retrieval felt slower and more useful than any course did. A short list of what I'd read first, knowing what I know now."
    }
  ];

  var logEl = document.getElementById("log");
  posts.forEach(function (p, idx) {
    var commit = document.createElement("div");
    commit.className = "commit";
    commit.dataset.open = "false";

    var isLast = idx === posts.length - 1;
    commit.innerHTML =
      '<div class="graph"><span class="node"></span>' + (isLast ? "" : '<span class="line"></span>') + "</div>" +
      '<div class="commit-body">' +
        '<button class="commit-head" type="button" aria-expanded="false">' +
          '<span class="hash">' + p.hash + "</span>" +
          '<span class="commit-msg">' + p.msg + "</span>" +
          '<span class="commit-date">' + p.date + "</span>" +
          '<span class="chevron">›</span>' +
        "</button>" +
        '<div class="commit-excerpt"><div><p>' + p.excerpt + "</p></div></div>" +
      "</div>";

    var btn = commit.querySelector(".commit-head");
    btn.addEventListener("click", function () {
      var open = commit.dataset.open === "true";
      commit.dataset.open = open ? "false" : "true";
      btn.setAttribute("aria-expanded", String(!open));
    });

    logEl.appendChild(commit);
  });

  /* ---------- Copy email ---------- */
  var copyBtn = document.getElementById("copyEmail");
  copyBtn.addEventListener("click", function () {
    var email = "daniyal@example.com";
    function done() {
      copyBtn.dataset.copied = "true";
      copyBtn.textContent = "copied";
      setTimeout(function () {
        copyBtn.dataset.copied = "false";
        copyBtn.textContent = "copy email";
      }, 1600);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(done).catch(function () {
        copyBtn.textContent = "couldn't copy — " + email;
      });
    } else {
      copyBtn.textContent = email;
    }
  });

  /* ---------- Last visit (per-browser convenience) ---------- */
  var lastVisitEl = document.getElementById("lastVisit");
  try {
    var prevVisit = window.localStorage.getItem("blog-last-visit");
    var now = new Date();
    var stamp = now.toISOString().slice(0, 16).replace("T", " ");
    if (prevVisit) {
      lastVisitEl.textContent = "~/daniyal % # last seen you " + prevVisit + " UTC";
    }
    window.localStorage.setItem("blog-last-visit", stamp);
  } catch (e) { /* storage unavailable, keep default footer text */ }

})();
