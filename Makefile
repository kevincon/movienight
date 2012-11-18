SHELL = /bin/sh
OUTPUT = mn.xml
S3_DIRS = js media img flash css
S3_TARGETS = $(OUTPUT) $(foreach DIR,$(S3_DIRS), $(shell ls -d $(DIR)/*))
S3CP = java -jar util/s3cp-cmdline.jar
BUCKET = s3://mn_movienight

default: put

put:
	$(S3CP) $(OUTPUT) $(BUCKET)/$(OUTPUT)

put_all:
	$(foreach TARGET,$(S3_TARGETS),$(S3CP) $(TARGET) $(BUCKET)/$(TARGET) ;)
