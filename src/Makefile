include ../Makefile.inc

default: all

# Note: These are in a very specific order.
CSS = video-js.css
BEGINNING = start.xml start.html $(CSS)
JAVASCRIPT = jquery.min.js video.js dropbox.js mn.js
MIDDLE = body.html $(JAVASCRIPT)
END = end.html end.xml

SRC_FILES = $(BEGINNING) $(MIDDLE) $(END)

all: $(SRC_FILES)
	cat $(SRC_FILES) > ../$(OUTPUT)