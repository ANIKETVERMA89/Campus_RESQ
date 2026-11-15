
#include "../include/Planner.h"
#include "../include/DijkstraRoute.h"
#include <algorithm>

Route findBestExit(RouteAlgorithm& algo, CampusGraph& graph, int source) {
    Route best;
    bool found = false;

    vector<int> exits = graph.getExitIds();

    for (int i = 0; i < exits.size(); i++) {
        Route r = algo.findRoute(graph, source, exits[i]);

        if (r.isValid()) {
            if (!found || r < best) {
                best = r;
                found = true;
            }
        }
    }

    return best;
}

void applyEmergencyHazard(CampusGraph& graph, const Emergency& e) {
    Node* n = graph.getNode(e.getLocationId());

    if (n == NULL) return;

    string type = e.getType();

    if (type == "Fire Emergency") {
        n->blocked = true;
        graph.spreadRisk(n->id, e.getSeverity(), 0.6, 4);
    }
    else if (type == "Security Emergency") {
        n->blocked = true;
        graph.spreadRisk(n->id, e.getSeverity(), 0.5, 3);
    }
}

ResponsePlan planResponse(CampusGraph& graph, const Emergency& e) {
    ResponsePlan plan;

    plan.scene = e.getLocationId();
    plan.staging = plan.scene;

    Node* scene = graph.getNode(plan.scene);

    if (scene == NULL) return plan;

    DijkstraRoute evac(1.0, 5.0, 1.5);
    DijkstraRoute responder(1.0, 2.0, 1.5);

    plan.evac = findBestExit(evac, graph, plan.scene);

    if (e.getType() == "Fire Emergency") {
        return plan;
    }

    vector<int> targets;

    if (!scene->blocked) {
        targets.push_back(plan.scene);
    }
    else {
        vector<Edge> edges = graph.getNeighbors(plan.scene);

        for (int i = 0; i < edges.size(); i++) {
            Node* n = graph.getNode(edges[i].destination);

            if (n != NULL && !n->blocked) {
                targets.push_back(n->id);
            }
        }
    }

    bool found = false;
    vector<int> exits = graph.getExitIds();

    for (int i = 0; i < targets.size(); i++) {
        for (int j = 0; j < exits.size(); j++) {

            Node* door = graph.getNode(exits[j]);

            if (door == NULL || door->blocked) continue;

            Route r = responder.findRoute(graph, exits[j], targets[i]);

            if (r.isValid()) {
                if (!found || r < plan.responder) {
                    plan.responder = r;
                    plan.staging = targets[i];
                    found = true;
                }
            }
        }
    }

    if (found) {
        plan.entry = plan.responder.getPath().front();
    }

    plan.staged = scene->blocked && found;

    return plan;
}

int safetyBand(double risk) {
    if (risk < 1.0) return 0;
    if (risk < 3.0) return 1;
    if (risk < 6.0) return 2;

    return 3;
}

const char* safetyBandName(int band) {
    if (band == 0) return "Safe";
    if (band == 1) return "Low risk";
    if (band == 2) return "Medium risk";
    if (band == 3) return "High risk";

    return "No route";
}

int routeBand(CampusGraph& graph, const Route& r) {
    if (!r.isValid()) return -1;

    int worst = 0;
    vector<int> path = r.getPath();

    for (int i = 0; i < path.size(); i++) {
        Node* n = graph.getNode(path[i]);

        if (n != NULL) {
            int band = safetyBand(n->risk);

            if (band > worst) {
                worst = band;
            }
        }
    }

    return worst;
}

Route findSafestRoute(CampusGraph& graph, int src,
                      const vector<int>& targets,
                      double a, double b, double c, bool noLifts) {

    DijkstraRoute d(a, b, c);

    Route best;
    bool found = false;

    for (int i = 0; i < targets.size(); i++) {
        Route r = d.findRoute(graph, src, targets[i]);

        if (r.isValid()) {
            if (!found || r < best) {
                best = r;
                found = true;
            }
        }
    }

    return best;
}

Guide guidePerson(CampusGraph& graph, int you,
                  const string& type, int at) {

    Guide g;

    if (graph.getNode(you) == NULL || graph.getNode(at) == NULL) {
        return g;
    }

    vector<int> targets;

    double a = 1.0;
    double b = 5.0;
    double c = 1.5;

    bool noLifts = true;

    if (type == "medical") {
        targets.push_back(at);
        b = 2.0;
        noLifts = false;
    }
    else {
        targets = graph.getExitIds();
    }

    g.route = findSafestRoute(graph, you, targets, a, b, c, noLifts);

    g.band = routeBand(graph, g.route);

    if (g.route.isValid()) {
        g.destination = g.route.getPath().back();
    }

    DijkstraRoute plain(1.0, 0.0, 0.0);

    for (int i = 0; i < targets.size(); i++) {
        Route r = plain.findRoute(graph, you, targets[i]);

        if (r.isValid()) {
            if (!g.shortest.isValid() || r < g.shortest) {
                g.shortest = r;
            }
        }
    }

    g.shortestBand = routeBand(graph, g.shortest);

    return g;
}
