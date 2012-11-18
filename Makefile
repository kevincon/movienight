SHELL = /bin/sh
OUTPUT = mn.xml
S3_DIRS = js media img flash css
S3_TARGETS = $(OUTPUT) $(foreach DIR,$(S3_DIRS), $(shell ls -d $(DIR)/*))
S3PUT = s3put
BUCKET = mn_movienight

default: put

# Install aws: http://timkay.com/aws/
# Copy mime.types to /etc/

put:
	$(S3PUT) $(BUCKET)/$(OUTPUT) $(OUTPUT)

put_all:
	$(foreach TARGET,$(S3_TARGETS),$(S3PUT) $(BUCKET)/$(TARGET) $(TARGET) ;)
