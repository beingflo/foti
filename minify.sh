#!/bin/bash

for file in $1/*
do
    basename=$(basename $file)
    echo $2/$basename
    convert $file -resize 30% $2/$basename
    jpegoptim -m 50 $2/$basename
done

#i=1
#for file in $1/*
#do
#    basename=$(basename $file)
#    mv $1/$basename $1/$i.jpg
#    i=$(($i+1))
#done
#
