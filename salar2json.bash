#!/bin/bash

# Student: Gustaf Holmer


cat "salar.csv" > "salar.txt"

keys=$(head -n2 "salar.txt" | tail -n1 | tr ';' ' ')

sed -i -e 1,2d "salar.txt" # remove first two lines in salar.txt

objectDone=

last_line=$(tail -n1 "salar.txt")
varDoubleTab=$'\t'''$'\t'

# Iterates over each line in the file
while IFS="" read -r line || [[ -n "$line" ]];
do

    # array which stores every line's items. Null if info is missing. Loop puts in the items on the right place. Does not access the last item.
    dataArray=()
    while read -r -d ";" item;
    do

        if [[ $item = "" ]]
        then
            dataArray+=( "null" )
        else
            dataArray+=( "$item" )
        fi
    done <<<"$line" 


    # Removes "\n" from last item.
    C=$(echo $line | cut -d";" -f9 | sed '/\n/d')
    if [[ "$line" == "$last_line" ]]
    then 
        tempLast=$C
    else
        tempLast=${C:0:${#C} - 1}
    fi

    # Adds the last item to the array
    if [[ $tempLast = '' ]]
    then
        dataArray+=( "null" )
    else
        dataArray+=( "$tempLast" )
    fi


    counterTwo=0
    jsonVar=

    # Loop where the data array containing the lines items are concenates with the information key, e.g. "Salsnr" etc.
    while read -r -d " " item2; do
        
        tempVar=

        if [[ ${dataArray[counterTwo]} = null ]]
        then
            tempVar=null
        else
            tempVar='"'"${dataArray[counterTwo]}"'"'
        fi
        

        jsonVar=''"$jsonVar"''"$varDoubleTab"''$'\t''"'"$item2"'": '"$tempVar"','$'\n'''
        
        # process last item
        if (( counterTwo == 7 ))
        then
            ((counterTwo=counterTwo+1))

            if [[ ${dataArray[counterTwo]} = "null" ]]
            then
                tempVar=null
            else
                tempVar='"'"${dataArray[counterTwo]}"'"'
            fi

            # needed to slice as \n came in the way
            B=$(echo $keys | cut -d" " -f9 | sed '/\n/d')
            item2=${B:0:7} 

            jsonVar=''"$jsonVar"''"$varDoubleTab"''$'\t''"'"$item2"'": '"$tempVar"''$'\n'''

        fi
        
        ((counterTwo=counterTwo+1))

    done <<<"$keys"

    # Checks if last line. Adds \n if so.
    if [[ "$line" == "$last_line" ]]
    then 
        objectDone=$objectDone''"$varDoubleTab"'{'$'\n'''"$jsonVar"''"$varDoubleTab"'}'
    else
        objectDone=$objectDone''"$varDoubleTab"'{'$'\n'''"$jsonVar"''"$varDoubleTab"'}',$'\n'
    fi

done <salar.txt 


# Hard coded the final braces
finalObjectDone='{'$'\n'''$'\t''"salar": ['$'\n'''"$objectDone"''$'\n'''$'\t'']'$'\n''}'


cat <<< "$finalObjectDone" > "salar.json"


rm -f "salar.txt-e"
rm -f "salar.txt"

exit 0

