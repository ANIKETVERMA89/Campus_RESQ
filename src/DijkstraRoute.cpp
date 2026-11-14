
#include "../include/DijkstraRoute.h"
#include <queue>
#include <vector>
#include <unordered_map>
#include <algorithm>
using namespace std;

Route DijkstraRoute::findRoute(CampusGraph& graph, int source, int destination) {

    Node* start = graph.getNode(source);
    Node* end = graph.getNode(destination);

    if (start == NULL || end == NULL) return Route();

    if (end->blocked && source != destination) return Route();

    unordered_map<int, double> dist;
    unordered_map<int, int> parent;

    priority_queue<pair<double, int>,
    vector<pair<double, int>>,
    greater<pair<double, int>>> pq;

    dist[source] = 0;
    pq.push({0, source});

    while (!pq.empty()) {

        int current = pq.top().second;
        double currentCost = pq.top().first;
        pq.pop();

        if (currentCost > dist[current]) continue;

        if (current == destination) break;

        vector<Edge> edges = graph.getNeighbors(current);

        for (int i = 0; i < edges.size(); i++) {

            int next = edges[i].destination;
            Node* nextNode = graph.getNode(next);

            if (nextNode == NULL || nextNode->blocked) continue;

            double newCost = currentCost + cost.calculate(
                edges[i].weight, nextNode->risk, 0
            );

            if (dist.find(next) == dist.end() || newCost < dist[next]) {

                dist[next] = newCost;
                parent[next] = current;
                pq.push({newCost, next});
            }
        }
    }

    if (dist.find(destination) == dist.end()) return Route();

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
        if (n != NULL) totalRisk += n->risk;

        vector<Edge> edges = graph.getNeighbors(path[i]);

        for (int j = 0; j < edges.size(); j++) {
            if (edges[j].destination == path[i + 1]) {
                distance += edges[j].weight;
                break;
            }
        }
    }

    return Route(source, destination, path, distance,
                 totalRisk, 0, dist[destination]);
}
