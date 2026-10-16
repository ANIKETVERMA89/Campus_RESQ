

#ifndef CAMPUSGRAPH_H
#define CAMPUSGRAPH_H

#include "Node.h"
#include "Edge.h"

#ifndef CAMPUSGRAPH_H
#define CAMPUSGRAPH_H

#include "node.h"
#include "edge.h"
#include <vector>
#include <unordered_map>

using namespace std;

class CampusGraph
{
private:

    unordered_map<int, Node*> nodes;
    unordered_map<int, vector<Edge>> adjacency;

public:
    void addNode(Node* node)
    {
        if (node == nullptr)
            return;

        nodes[node->id] = node;
    }

    Node* getNode(int id) const
    {
        auto it = nodes.find(id);

        if (it != nodes.end())
            return it->second;

        return nullptr;
    }

    void addEdge(Node* from, Node* to, double weight = 1.0)
    {
        if (from == nullptr || to == nullptr)
            return;

        adjacency[from->id].push_back(Edge(to->id, weight));
        adjacency[to->id].push_back(Edge(from->id, weight));
    }
    void displayGraph() const
{
    cout << "\n===== CAMPUS GRAPH =====\n";

    for (const auto& pair : nodes)
    {
        int id = pair.first;
        Node* node = pair.second;

        cout << id << " - " << node->name << " -> ";

        auto it = adjacency.find(id);

        if (it != adjacency.end())
        {
            for (const Edge& edge : it->second)
            {
                cout << edge.destination
                     << " (weight: " << edge.weight << ") ";
            }
        }

        cout << endl;
    }

    cout << "========================\n";
}
};

#endif

    vector<Node*> nodes;
    unordered_map<int, vector<Edge*>> adjacencyList;

public:
    void addNode(Node* node);
    void addEdge(Node* source, Node* destination, double distance);

    Node* getNode(int id) const;
    vector<Edge*> getNeighbors(int id) const;

    void displayGraph() const;
};

#endif
