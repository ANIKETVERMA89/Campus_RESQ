
#ifndef NODE_H
#define NODE_H

#include <string>
using namespace std;

class Node
{
public:
    int id;
    string name;

    Node(int i, string n)
    {
        id = i;
        name = n;
    }
};

#endif
