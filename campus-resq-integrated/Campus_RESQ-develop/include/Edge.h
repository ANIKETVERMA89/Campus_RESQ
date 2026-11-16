#ifndef EDGE_H
#define EDGE_H

class Edge
{
public:
    int destination;
    double weight;   // walking distance in metres

    Edge(int dest, double w = 1.0)
    {
        destination = dest;
        weight = w;
    }
};

#endif
