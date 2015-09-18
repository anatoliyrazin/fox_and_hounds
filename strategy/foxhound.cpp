// Fox and Hounds - build the game strategy
// see the rules here:
// https://en.wikipedia.org/wiki/Fox_games
// the program is building strategy for hounds by
// "learning" w/l configuration
// using dynamic programming to build all configuration table
// this version creates a file with all possible w/l values,
// however the values are binary and do not contain "steps to win" data

#include <iostream>
using namespace std;

#include <stdio.h>

// number of black cells and C(32, 5) checker configurations
const int size = 32;
const int volume = size * (size - 1) * (size - 2) * (size - 3) * (size - 4) / 120;

// fox and hound wins / moves
const int fox = 0;
const int hound = 1;

// binomial coefficient calculation: C(n, k)
int binc(int n, int k) {
    int p = 1;
    int q = 1;
    for(int i = 1; i <= k; i++) {
        p *= n--;
        q *= i;
    }

    return p / q;
}

// calculate order number for combination of 5 from 32
// the number is zero based
int getIndex(int a, int b, int c, int d, int e) {
    int r = 0;
    
    int l[6];
    l[0] = 0;
    l[1] = a + 1;
    l[2] = b + 1;
    l[3] = c + 1;
    l[4] = d + 1;
    l[5] = e + 1;

    for(int i = 1; i <= 5; i++) {
        for(int j = l[i-1] + 1; j <= l[i] - 1; j++) {
            r += binc(size - j, 5 - i);
        }
    }
    
    return r;
}

// convert order number for combination of 5 from 32
// into the combination
// both order number and combination numbers are zero based
int setIndex(int l[], int ind) {
    ind++;

    l[0] = 0;
    int s = 0;
    for(int t = 1; t <= 5; t++) {
        int j = l[t-1] + 1;
        int c = binc(size - j, 5 - t);
        while(j < size - 5 + t && s + c < ind) {
            s += c;
            j++;
            c = binc(size - j, 5 - t);
        }
        l[t] = j;
    }

    for(int t = 1; t <= 5; t++) {
        l[t]--;
    }

    return 0;
}

// whos move by game position set
// return fox or hound const
int getMove(int lset[]) {
    int s = 0;
    for(int i = 1; i <= 5; i++) {
        s += lset[i] / 4;
    }

    return s % 2;
}

// list of possible fox moves
int foxMoves(int m[], int pos) {
    m[0] = pos - 5 + pos / 4 % 2;
    m[1] = pos - 4 + pos / 4 % 2;
    m[2] = pos + 3 + pos / 4 % 2;
    m[3] = pos + 4 + pos / 4 % 2;
    for(int i = 0; i < 4; i++) {
        if(m[i] < 0 || m[i] >= size || (m[i] / 4 - pos / 4) * (m[i] / 4 - pos / 4) != 1) {
            m[i] = -1;
        }
    }

    return 0;
}

// check if a hound is at the cell position
int houndFound(int pos, const int lset[]) {
    for(int i = 1; i <= 5; i++) {
        if(lset[i] == pos) {
            return 1;
        }
    }

    return 0;
}

// normalize game position to required format
// cell numbers must be in ascending order
int insertValue(int l[], int &fpos, const int n[], int pos) {
    int inserted = 0;
    int i = 1;
    int f = n[fpos+1];
    for(int k = 1; k <= 5; k++) {
        if(k != pos) {
            if(!inserted && n[pos] < n[k]) {
                l[i++] = n[pos];
                inserted = 1;
            }

            l[i++] = n[k];
        }
    }
    if(!inserted) {
        l[i] = n[pos];
    }

    for(int k = 1; k <= 5; k++) {
        if(l[k] == f) {
            fpos = k - 1;
        }
    }
}

// check game position if moving the fox
int moveFox(int game[][5], int nset[], int fpos) {
    int lset[6];
    int fpos1 = fpos;
    insertValue(lset, fpos1, nset, fpos + 1);
    int ind = getIndex(lset[1], lset[2], lset[3], lset[4], lset[5]);

    return game[ind][fpos1];
}

// copy game position set
int copySet(int nset[], int lset[]) {
    for(int k = 1; k <= 5; k++) {
        nset[k] = lset[k];
    }

    return 0;
}

// get combination number and normalized fox position
// with a hound moved
int newHound(int l[], int &fpos, int k) {
    for(int i = 1; i <= 5; i++) {
       if(i != k && l[k] == l[i]) {
                return -1;
       }
    }
    int l1[6];
    insertValue(l1, fpos, l, k);
    int ind = getIndex(l1[1], l1[2], l1[3], l1[4], l1[5]);

    return ind;
}

// get normalized position when a hound moved left direction
int houndLeft(int l[], int &fpos, int k) {
    if(l[k] / 4 == 0) {
        return -1;
    }
    if(l[k] % 8 == 0) {
        return -1;
    }
    
    if(l[k] / 4 % 2 == 1) {
        l[k] -= 4;
    } else if(l[k] / 4 % 2 == 0) {
        l[k] -= 5;
    }
    
    return newHound(l, fpos, k);
}

// get normalized position when a hound moved right direction
int houndRight(int l[], int &fpos, int k) {
    if(l[k] / 4 == 0) {
        return -1;
    }
    if(l[k] % 8 == 7) {
        return -1;
    }
    
    if(l[k] / 4 % 2 == 1) {
        l[k] -= 3;
    } else if(l[k] / 4 % 2 == 0) {
        l[k] -= 4;
    }
    
    return newHound(l, fpos, k);
}

// check all hound moves to get position w/l value
int houndMoves(int game[][5], int lset[], int fpos) {
    int stop = 1;
    for(int k = 1; k <= 5; k++) {
        if(k != fpos + 1) {
            int l1[6];
            int fpos1 = fpos;
            copySet(l1, lset);
            int lind = houndLeft(l1, fpos1, k);
            if(lind >= 0) {
                if(game[lind][fpos1] == hound) {
                    return hound;
                } else if(game[lind][fpos1] != fox) {
                    stop = 0;
                }
            }
            int l2[6];
            int fpos2 = fpos;
            copySet(l2, lset);
            int rind = houndRight(l2, fpos2, k);
            if(rind >= 0) {
                if(game[rind][fpos2] == hound) {
                    return hound;
                } else if(game[rind][fpos2] != fox) {
                    stop = 0;
                }
            }
        }
    }
    if(stop) {
        return fox;
    }

    return -1;
}

// check position and set w/l value if appropriate
int checkPos(int game[][5], int bpos, int fpos) {
    int lset[6];
    setIndex(lset, bpos);
    int pmove = getMove(lset);
    if(pmove == fox) {
        int nset[6];
        copySet(nset, lset);
        int fset[4];
        foxMoves(fset, lset[fpos+1]);
        int available = 0;
        for(int i = 0; i < 4; i++) {
            if(fset[i] >= 0 && !houndFound(fset[i], lset)) {
                available = 1;
                nset[fpos+1] = fset[i];
                int mover = moveFox(game, nset, fpos);
                if(mover == fox) {
                    game[bpos][fpos] = fox;
                    return 1;
                } else if(mover == hound) {
                    available = 0;
                } else {
                    return 0;
                }
            }
        }
        if(!available) {
            game[bpos][fpos] = hound;
            return 1;
        }
    } else {
        if(lset[fpos+1] / 4 == 7) {
            game[bpos][fpos] = fox;
            return 1;
        } else {
            int hmove = houndMoves(game, lset, fpos);
            if(hmove == fox) {
                game[bpos][fpos] = fox;
                return 1;
            } else if(hmove == hound) {
                game[bpos][fpos] = hound;
                return 1;
            } else {
                return 0;
            }
        }
    }
    
    return 0;
}

// "bit" data for strategy output file
int bit(int a) {
    int b = a;
    if(b == -1) {
        b = 0;
    }
    return b;
}

// game setup: add all configurations in "normal" mode
int initGame(int game[][5]) {
    int bpos = 0;
    int ctrl = 0;
    for(int i1 = 0; i1 < size - 4; i1++) {
        for(int i2 = i1 + 1; i2 < size - 3; i2++) {
            for(int i3 = i2 + 1; i3 < size - 2; i3++) {
                for(int i4 = i3 + 1; i4 < size - 1; i4++) {
                    for(int i5 = i4 + 1; i5 < size; i5++) {
                        for(int fpos = 0; fpos < 5; fpos++) {
                            game[bpos][fpos] = -1;
                        }
                        bpos++;
                    }
                }
            }
        }
    }
    return 0;
}

// dp to crete w/l table
// go through all configurations
int buildGame(int game[][5]) {
    int cont = 1;
    int step = 0;
    while(cont) {
        step++;
        cout << "step " << step << endl;
        cont = 0;
        int bpos = 0;
        for(int i1 = 0; i1 < size - 4; i1++) {
            for(int i2 = i1 + 1; i2 < size - 3; i2++) {
                for(int i3 = i2 + 1; i3 < size - 2; i3++) {
                    for(int i4 = i3 + 1; i4 < size - 1; i4++) {
                        for(int i5 = i4 + 1; i5 < size; i5++) {
                            int bpos = getIndex(i1, i2, i3, i4, i5);
                            for(int fpos = 0; fpos < 5; fpos++) {
                                if(game[bpos][fpos] == -1) {
                                    if(checkPos(game, bpos, fpos)) {
                                        cont = 1;
                                    }
                                }
                            }
                            bpos++;
                        }
                    }
                }
            }
        }
    }
    return 0;
}

// save game strategy to file
int saveGame(int game[][5]) {
    unsigned char buffer[volume * 5 / 8 + 1];
    int b = 0;
    int k = 0;
    unsigned char c;
    for(int i = 0; i < volume; i++) {
        for(int j = 0; j < 5; j++) {
            if(k % 8 == 0) {
                if(k) {
                    buffer[b++] = c;
                }
                c = bit(game[i][j]);
            } else {
                c *= 2;
                c += bit(game[i][j]);
            }
            k++;
        }
    }
    
    FILE *out = fopen("foxhound.bin", "wb");
    if(out) {
        for(int i = 0; i < volume * 5 / 8 + 1; i++) {
            fprintf(out, "%c", buffer[i]);
        }
        fclose(out);
        return 1;
    }
    return 0;
}

// load game strategy from the file
int loadGame(int game[][5]) {
    FILE *in = fopen("foxhound.bin", "rb");

    int bpos = 0;
    int fpos = 0;
    
    if(in) {
        unsigned char c;
        for(int i = 0; i < volume * 5 / 8 + 1; i++) {
            fscanf(in, "%c", &c);
            int vals[8];
            int m = 8;
            while(m--) {
                vals[m] = c % 2;
                c /= 2;
            }
            for(m = 0; m < 8; m++) {
                if(bpos < volume) {
                    game[bpos][fpos] = vals[m];
                }
                fpos++;
                if(fpos >= 5) {
                    fpos = 0;
                    bpos++;
                }
            }
        }
        fclose(in);
        return 1;
    }
    return 0;
}

int main() {

    int game[volume][5];
    int testmode = 1;
    
    /*
    *28*29*30*31
    24*25*26*27*
    *20*21*22*23
    16*17*18*19*
    *12*13*14*15
    08*09*10*11*
    *04*05*06*07
    00*01*02*03*
    */

    // get game strategy
    int loaded = loadGame(game);
    if(!loaded) {
        initGame(game);
        buildGame(game);

        saveGame(game);
    }

    // test sample configuration
    int ind1 = getIndex(2, 28, 29, 30, 31);
    cout << ind1 << " " << game[ind1][0] << endl;

    return 0;
}
