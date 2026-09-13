(() => {
  "use strict";

  const LOCAL =
    location.hostname === "127.0.0.1" ||
    location.hostname === "localhost";

  const API =
    window.AI_OS_API_URL ||
    (
      LOCAL
        ? location.protocol +
          "//" +
          location.hostname +
          ":3001"
        : location.origin
    );

  const state = {
    agents: [],
    jobs: [],
    events: [],
    socket: null,
    reconnectTimer: null,
    refreshTimer: null,
    stopping: false
  };

  const $ = id =>
    document.getElementById(id);

  const escapeHtml = value =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const formatError = error =>
    error instanceof Error
      ? error.stack || error.message
      : String(error ?? "Unknown error");

  function setConnection(
    status,
    text
  ) {
    const connection =
      $("connection");

    const sidebarDot =
      $("sidebarDot");

    if (connection) {
      connection.classList.remove(
        "online",
        "offline"
      );

      if (
        status === "online" ||
        status === "offline"
      ) {
        connection.classList.add(
          status
        );
      }
    }

    if (sidebarDot) {
      sidebarDot.classList.remove(
        "online",
        "offline"
      );

      if (
        status === "online" ||
        status === "offline"
      ) {
        sidebarDot.classList.add(
          status
        );
      }
    }

    if ($("connectionText")) {
      $("connectionText")
        .textContent = text;
    }

    if ($("sidebarStatus")) {
      $("sidebarStatus")
        .textContent = text;
    }
  }

  async function api(
    route,
    options = {}
  ) {
    const controller =
      new AbortController();

    const timer =
      setTimeout(
        () =>
          controller.abort(),
        15000
      );

    try {
      const response =
        await fetch(
          API + route,
          {
            ...options,
            signal:
              options.signal ||
              controller.signal
          }
        );

      const raw =
        await response.text();

      if (!response.ok) {
        throw new Error(
          `API ${response.status}: ${raw}`
        );
      }

      return raw
        ? JSON.parse(raw)
        : null;

    } finally {
      clearTimeout(timer);
    }
  }

  function renderKpis() {
    const running =
      state.jobs.filter(
        job =>
          job.status === "running"
      ).length;

    const completed =
      state.jobs.filter(
        job =>
          job.status === "completed"
      ).length;

    const failed =
      state.jobs.filter(
        job =>
          job.status === "failed"
      ).length;

    const finished =
      completed + failed;

    $("agentsKpi").textContent =
      String(
        state.agents.length
      );

    $("runningKpi").textContent =
      String(running);

    $("completedKpi").textContent =
      String(completed);

    $("failedKpi").textContent =
      String(failed);

    $("successKpi").textContent =
      finished
        ? (
            completed /
            finished *
            100
          ).toFixed(1) + "%"
        : "—";
  }

  function renderAgents() {
    $("agentMeta").textContent =
      `${state.agents.length} online`;

    $("agentSelect").innerHTML =
      state.agents.length
        ? state.agents
            .map(
              agent =>
                `<option value="${escapeHtml(agent.id)}">${escapeHtml(agent.name)}</option>`
            )
            .join("")
        : `<option value="">No agents available</option>`;

    $("agentGrid").innerHTML =
      state.agents.length
        ? state.agents
            .map(
              agent =>
                `<article class="agent-card">
                  <div class="agent-top">
                    <div>
                      <div class="agent-name">
                        ${escapeHtml(agent.name)}
                      </div>

                      <div class="agent-id">
                        ${escapeHtml(agent.id)}
                      </div>
                    </div>

                    <div class="agent-online">
                      ● online
                    </div>
                  </div>

                  <div class="agent-model">
                    ${escapeHtml(agent.model)}
                  </div>

                  <div class="agent-meta">
                    ${Number(agent.tools?.length || 0)}
                    tools
                    ·
                    ${Number(agent.runtimeCapabilities?.length || 0)}
                    capabilities
                  </div>
                </article>`
            )
            .join("")
        : `<div class="empty">
            No registered agents.
          </div>`;
  }

  function renderJobs() {
    $("jobMeta").textContent =
      `${state.jobs.length} missions`;

    const rows =
      [...state.jobs]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        )
        .slice(0, 50);

    $("jobTable").innerHTML =
      rows.length
        ? rows
            .map(
              job => {
                const goal =
                  job.mission &&
                  typeof job.mission === "object"
                    ? String(
                        job.mission.goal ||
                        ""
                      )
                    : "";

                return `<tr>
                  <td>
                    <div style="font-weight:650;color:#eef3f8">
                      ${escapeHtml(
                        goal
                          ? goal.slice(0, 70)
                          : job.id
                      )}
                    </div>

                    <div style="margin-top:4px;color:var(--muted-2);font-size:8px">
                      ${escapeHtml(job.id)}
                    </div>
                  </td>

                  <td>
                    ${escapeHtml(job.agentId)}
                  </td>

                  <td>
                    <span class="badge ${escapeHtml(job.status)}">
                      ${escapeHtml(job.status)}
                    </span>
                  </td>

                  <td>
                    ${escapeHtml(
                      new Date(
                        job.createdAt
                      ).toLocaleString()
                    )}
                  </td>
                </tr>`;
              }
            )
            .join("")
        : `<tr>
            <td colspan="4">
              <div class="empty">
                No missions yet.
              </div>
            </td>
          </tr>`;
  }

  function renderEvents() {
    $("eventMeta").textContent =
      `${state.events.length} events`;

    const recent =
      [...state.events]
        .slice(-100)
        .reverse();

    $("eventStream").innerHTML =
      recent.length
        ? recent
            .map(
              event =>
                `<div class="event">
                  <div class="event-head">
                    <span class="event-type">
                      ${escapeHtml(event.type)}
                    </span>

                    <span class="event-time">
                      ${
                        event.timestamp
                          ? escapeHtml(
                              new Date(
                                event.timestamp
                              ).toLocaleTimeString()
                            )
                          : ""
                      }
                    </span>
                  </div>

                  <div class="event-meta">
                    ${
                      event.agentId
                        ? `agent=${escapeHtml(event.agentId)}`
                        : ""
                    }

                    ${
                      event.toolId
                        ? ` · tool=${escapeHtml(event.toolId)}`
                        : ""
                    }

                    ${
                      event.action
                        ? ` · action=${escapeHtml(event.action)}`
                        : ""
                    }

                    ${
                      event.durationMs != null
                        ? ` · ${escapeHtml(event.durationMs)}ms`
                        : ""
                    }
                  </div>
                </div>`
            )
            .join("")
        : `<div class="empty">
            Waiting for runtime activity…
          </div>`;
  }

  function renderFailures() {
    const failedJobs =
      [...state.jobs]
        .filter(
          job =>
            job.status === "failed"
        )
        .reverse()
        .slice(0, 25);

    const failedEvents =
      [...state.events]
        .filter(
          event =>
            String(
              event.type || ""
            ).endsWith(".failed") ||
            event.success === false
        )
        .reverse()
        .slice(0, 25);

    $("failureMeta").textContent =
      `${failedJobs.length + failedEvents.length} recorded`;

    const blocks = [];

    for (
      const job
      of failedJobs
    ) {
      const result =
        job.result &&
        typeof job.result === "object"
          ? job.result
          : {};

      const cause =
        job.error ||
        result.error ||
        result.reason ||
        result.message ||
        "Mission failed without an explicit error.";

      blocks.push(
        `<div class="failure">
          <div class="failure-title">
            Mission Failure
          </div>

          <div class="failure-meta">
            agent=${escapeHtml(job.agentId)}
            ·
            job=${escapeHtml(job.id)}
          </div>

          <div class="failure-error">${escapeHtml(cause)}</div>
        </div>`
      );
    }

    for (
      const event
      of failedEvents
    ) {
      blocks.push(
        `<div class="failure">
          <div class="failure-title">
            ${escapeHtml(event.type)}
          </div>

          <div class="failure-meta">
            ${
              event.agentId
                ? `agent=${escapeHtml(event.agentId)}`
                : ""
            }

            ${
              event.toolId
                ? ` · tool=${escapeHtml(event.toolId)}`
                : ""
            }

            ${
              event.action
                ? ` · action=${escapeHtml(event.action)}`
                : ""
            }
          </div>

          <div class="failure-error">${escapeHtml(
            event.error ||
            "Execution failure"
          )}</div>
        </div>`
      );
    }

    $("failureStream").innerHTML =
      blocks.length
        ? blocks.join("")
        : `<div class="empty">
            No failures recorded.
          </div>`;
  }

  function renderAll() {
    renderKpis();
    renderAgents();
    renderJobs();
    renderEvents();
    renderFailures();
  }

  async function refresh() {
    const [
      agents,
      jobs,
      events
    ] =
      await Promise.all([
        api("/agents"),
        api("/jobs"),
        api("/events?limit=500")
      ]);

    state.agents =
      Array.isArray(agents)
        ? agents
        : [];

    state.jobs =
      Array.isArray(jobs)
        ? jobs
        : [];

    state.events =
      Array.isArray(events)
        ? events
        : [];

    renderAll();
  }

  function connectSocket() {
    if (state.stopping) {
      return;
    }

    if (
      state.socket &&
      (
        state.socket.readyState ===
          WebSocket.OPEN ||
        state.socket.readyState ===
          WebSocket.CONNECTING
      )
    ) {
      return;
    }

    setConnection(
      "",
      "Connecting…"
    );

    $("liveIndicator")
      .textContent =
      "CONNECTING";

    const ws =
      API.replace(
        /^http/,
        "ws"
      ) +
      "/events/live";

    state.socket =
      new WebSocket(ws);

    state.socket.onopen =
      () => {
        setConnection(
          "online",
          "Runtime connected"
        );

        $("liveIndicator")
          .textContent =
          "LIVE";
      };

    state.socket.onmessage =
      async message => {
        try {
          const event =
            JSON.parse(
              message.data
            );

          if (
            event.type ===
            "connection.ready"
          ) {
            return;
          }

          state.events.push(
            event
          );

          if (
            state.events.length >
            5000
          ) {
            state.events =
              state.events.slice(
                -5000
              );
          }

          renderEvents();
          renderFailures();

          try {
            state.jobs =
              await api(
                "/jobs"
              );

            renderJobs();
            renderKpis();
            renderFailures();

          } catch (error) {
            console.error(
              "Job refresh failed",
              error
            );
          }

        } catch (error) {
          console.error(
            "Live event failed",
            error
          );
        }
      };

    state.socket.onerror =
      () => {
        setConnection(
          "offline",
          "Connection error"
        );

        $("liveIndicator")
          .textContent =
          "ERROR";
      };

    state.socket.onclose =
      () => {
        state.socket =
          null;

        if (state.stopping) {
          return;
        }

        setConnection(
          "offline",
          "Reconnecting…"
        );

        $("liveIndicator")
          .textContent =
          "RECONNECTING";

        clearTimeout(
          state.reconnectTimer
        );

        state.reconnectTimer =
          setTimeout(
            connectSocket,
            1500
          );
      };
  }

  async function launchMission() {
    const agentId =
      $("agentSelect").value;

    const goal =
      $("missionGoal")
        .value
        .trim();

    if (!agentId || !goal) {
      $("missionStatus")
        .textContent =
        "Select an agent and enter a mission.";

      return;
    }

    $("launchButton")
      .disabled =
      true;

    $("missionStatus")
      .textContent =
      "Launching mission…";

    try {
      const missionId =
        "mission-" +
        Date.now() +
        "-" +
        Math.random()
          .toString(36)
          .slice(2, 8);

      const job =
        await api(
          "/missions",
          {
            method:
              "POST",

            headers: {
              "content-type":
                "application/json"
            },

            body:
              JSON.stringify({
                agentId,

                mission: {
                  id:
                    missionId,

                  goal,

                  maxIterations:
                    25
                }
              })
          }
        );

      $("missionStatus")
        .textContent =
        "Mission launched: " +
        job.id;

      $("missionGoal").value =
        "";

      state.jobs =
        await api(
          "/jobs"
        );

      renderJobs();
      renderKpis();

    } catch (error) {
      $("missionStatus")
        .textContent =
        formatError(error);

    } finally {
      $("launchButton")
        .disabled =
        false;
    }
  }

  async function start() {
    setConnection(
      "",
      "Connecting…"
    );

    $("launchButton")
      .addEventListener(
        "click",
        launchMission
      );

    try {
      await refresh();

      connectSocket();

      state.refreshTimer =
        setInterval(
          async () => {
            try {
              await refresh();
            } catch (error) {
              console.error(
                "Background refresh failed",
                error
              );
            }
          },
          15000
        );

    } catch (error) {
      console.error(
        "Dashboard startup failed",
        error
      );

      setConnection(
        "offline",
        "API unavailable"
      );

      $("missionStatus")
        .textContent =
        "Dashboard startup failed:\n" +
        formatError(error);
    }
  }

  window.addEventListener(
    "beforeunload",
    () => {
      state.stopping =
        true;

      clearTimeout(
        state.reconnectTimer
      );

      clearInterval(
        state.refreshTimer
      );

      if (
        state.socket
      ) {
        state.socket.close();
      }
    }
  );

  start();
})();
