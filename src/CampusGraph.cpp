
#include "../include/CampusGraph.h"
#include <queue>
using namespace std;

CampusGraph::~CampusGraph() {
    for (auto it = nodes.begin(); it != nodes.end(); it++) {
        delete it->second;
    }
}

void CampusGraph::addNode(Node* node) {
    if (node != NULL) {
        nodes[node->id] = node;

        if (node->name.find("Exit") != string::npos) {
            exitIds.push_back(node->id);
        }
    }
}

Node* CampusGraph::getNode(int id) const {
    if (nodes.find(id) != nodes.end()) {
        return nodes.at(id);
    }
    return NULL;
}

void CampusGraph::addEdge(Node* from, Node* to, double weight) {
    if (from == NULL || to == NULL) return;

    adjacency[from->id].push_back(Edge(to->id, weight));
    adjacency[to->id].push_back(Edge(from->id, weight));
}

const vector<Edge>& CampusGraph::getNeighbors(int id) const {
    static vector<Edge> empty;

    if (adjacency.find(id) != adjacency.end()) {
        return adjacency.at(id);
    }

    return empty;
}

vector<int> CampusGraph::getExitIds() const {
    return exitIds;
}

void CampusGraph::spreadRisk(int origin, double intensity, double decay, int maxHops) {
    

    if (getNode(origin) == NULL) return;

    queue<pair<int, double>> q;
    unordered_map<int, bool> visited;

    q.push({origin, intensity});
    visited[origin] = true;

    int level = 0;

    while (!q.empty() && level <= maxHops) {
        int count = q.size();

        for (int i = 0; i < count; i++) {
            int current = q.front().first;
            double riskValue = q.front().second;
            q.pop();

            Node* n = getNode(current);

          if (n != NULL) n->risk += riskValue;

            vector<Edge> edges = getNeighbors(current);

            for (int j = 0; j < edges.size(); j++) {
                int next = edges[j].destination;

                if (visited.find(next) == visited.end()) {
                    visited[next] = true;
                    q.push({next, riskValue * decay});
                }
            }
        }

        level++;
    }
}


void CampusGraph::resetState() {
    for (auto it = nodes.begin(); it != nodes.end(); it++) {
        it->second->risk = 0;
    }
}


void CampusGraph::displayGraph() const {
    for (auto it = nodes.begin(); it != nodes.end(); it++) {
        cout << it->first << " - " << it->second->name;
        cout << " | Risk: " << it->second->risk;
        cout << " | Blocked: " << it->second->blocked;
        cout << ": ";

        vector<Edge> edges = getNeighbors(it->first);

        for (int i = 0; i < edges.size(); i++) {
            cout << edges[i].destination << "(" << edges[i].weight << ") ";
        }

        cout << endl;
    }
}

void CampusGraph::exportJson(ostream& os, double metresPerUnit) const {
    os << "{\"nodes\":[";

    bool first = true;

    for (auto it = nodes.begin(); it != nodes.end(); it++) {
        if (!first) os << ",";
        first = false;

        os << "{\"id\":" << it->first
           << ",\"name\":\"" << it->second->name
           << "\",\"risk\":" << it->second->risk
           << ",\"blocked\":" << (it->second->blocked ? "true" : "false")
           << "}";
    }

    os << "],\"edges\":[";

    first = true;

    for (auto it = adjacency.begin(); it != adjacency.end(); it++) {
        for (int i = 0; i < it->second.size(); i++) {
            int from = it->first;
            int to = it->second[i].destination;

            if (from < to) {
                if (!first) os << ",";
                first = false;

                os << "{\"from\":" << from
                   << ",\"to\":" << to
                   << ",\"distance\":" << it->second[i].weight * metresPerUnit
                   << "}";
            }
        }
    }

    os << "]}";
}
