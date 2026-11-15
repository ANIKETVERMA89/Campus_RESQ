
#ifndef GROUND_H
#define GROUND_H

#include "CampusGraph.h"
#include "Node.h"

using namespace std;

inline void buildGroundFloor(CampusGraph& graph)
{
    graph.addNode(new Node(1, "Main Entrance"));
    graph.addNode(new Node(2, "Admission Enquiry"));
    graph.addNode(new Node(3, "Library"));
    graph.addNode(new Node(4, "Exit"));
    graph.addNode(new Node(5, "MI Room"));
    graph.addNode(new Node(6, "Female Staff Toilet"));
    graph.addNode(new Node(7, "Seminar Hall"));
    graph.addNode(new Node(8, "Collaboration Center"));
    graph.addNode(new Node(9, "Junction"));
    graph.addNode(new Node(10, "Class 007"));
    graph.addNode(new Node(11, "Staff Room 1"));
    graph.addNode(new Node(12, "Research Department"));
    graph.addNode(new Node(13, "Stairs"));
    graph.addNode(new Node(14, "Girls Lift"));
    graph.addNode(new Node(15, "Boys Lift"));
    graph.addNode(new Node(16, "Lab 10"));
    graph.addNode(new Node(17, "Handicap Toilet"));
    graph.addNode(new Node(18, "Girls Toilet"));
    graph.addNode(new Node(19, "Exit 4"));
    graph.addNode(new Node(20, "Class 016"));
    graph.addNode(new Node(21, "Class 015"));
    graph.addNode(new Node(22, "Class 014"));
    graph.addNode(new Node(23, "Class 013"));
    graph.addNode(new Node(24, "Exit"));
    graph.addNode(new Node(25, "Guest/Staff Toilet"));
    graph.addNode(new Node(26, "Boys Toilet"));
    graph.addNode(new Node(27, "Lab 1"));
    graph.addNode(new Node(28, "Back Audi"));
    graph.addNode(new Node(29, "Meeting Hall"));
    graph.addNode(new Node(30, "Placement / Alumni Helpdesk"));
    graph.addNode(new Node(31, "Boys Toilet"));
    graph.addNode(new Node(32, "Guest Toilet"));
    graph.addNode(new Node(33, "Stairs"));
    graph.addNode(new Node(34, "Open Audi"));
    graph.addNode(new Node(35, "Stairs"));
    graph.addNode(new Node(36, "Exit"));

    double edges[][3] = {
        {1,35,2}, {1,2,3}, {1,33,2}, {1,34,5},
        {2,35,2}, {2,3,2}, {2,34,6},

        {3,4,1}, {3,5,1}, {4,5,1},
        {5,6,1}, {6,7,4}, {6,34,9},

        {7,8,3}, {7,34,8},
        {8,9,3}, {8,34,4},

        {9,10,2}, {9,11,2}, {9,12,3},
        {9,13,2}, {9,14,3}, {9,34,6},

        {10,12,2}, {10,29,3}, {10,34,7},

        {11,14,1},
        {12,15,1},

        {14,16,2}, {14,28,3},
        {15,27,2},

        {16,17,2}, {16,20,2},

        {17,18,1}, {17,19,2}, {17,20,1},
        {18,19,1}, {18,20,3}, {19,20,3},

        {20,21,2},
        {21,22,1}, {21,28,2},
        {22,23,2}, {22,28,2},

        {23,24,1}, {23,25,1}, {23,27,1}, {23,28,3},

        {24,26,1}, {25,26,1},
        {27,28,3},

        {29,30,5}, {29,32,4}, {29,34,8},

        {30,31,2}, {30,32,3}, {30,33,1},
        {30,34,7}, {30,36,13},

        {31,32,2}, {33,34,6}
    };

    int edgeCount = sizeof(edges) / sizeof(edges[0]);

    for (int i = 0; i < edgeCount; i++)
    {
        Node* source = graph.getNode((int)edges[i][0]);
        Node* destination = graph.getNode((int)edges[i][1]);

        if (source != nullptr && destination != nullptr)
        {
            graph.addEdge(source, destination, edges[i][2]);
        }
    }
}

#endif
