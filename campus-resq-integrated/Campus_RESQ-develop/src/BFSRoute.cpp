
#include "../include/BFSRoute.h"
#include <queue>
#include <unordered_map>
#include <unordered_set>
#include <algorithm>

using namespace std;

Route BFSRoute::findRoute(CampusGraph& graph, int source, int destination) {

    Node* start = graph.getNode(source);
    Node* end = graph.getNode(destination);

    if (start == NULL || end == NULL) return Route();

    if (end->blocked && source != destination) return Route();

    queue<int> q;
    unordered_set<int> visited;
    unordered_map<int, int> parent;

    q.push(source);
    visited.insert(source);

    while (!q.empty()) {

        int current = q.front();
        q.pop();

        if (current == destination) break;

        vector<Edge> edges = graph.getNeighbors(current);

        for (int i = 0; i < edges.size(); i++) {

            int next = edges[i].destination;
            Node* n = graph.getNode(next);

            if (n != NULL && !n->blocked &&
                visited.find(next) == visited.end()) {

                visited.insert(next);
                parent[next] = current;
                q.push(next);
            }
        }
    }

    if (visited.find(destination) == visited.end()) return Route();

    vector<int> path;
    int current = destination;

    while (current != source) {
        path.push_back(current);
        current = parent[current];
    }

    path.push_back(source);
    reverse(path.begin(), path.end());

    double distance = 0;
    double totalRisk = 0;

    for (int i = 0; i < path.size() - 1; i++) {

        Node* n = graph.getNode(path[i + 1]);

        if (n != NULL) {
            totalRisk += n->risk;
        }

        vector<Edge> edges = graph.getNeighbors(path[i]);

        for (int j = 0; j < edges.size(); j++) {

            if (edges[j].destination == path[i + 1]) {
                distance += edges[j].weight;
                break;
            }
        }
    }

    return Route(source, destination, path, distance,
                 totalRisk, 0, distance);
}
