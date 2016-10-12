# Makefile for zipping node projects
# add your ignores to the ignore files section

ignore_files = node_modules .git Makefile
files := $(filter-out $(ignore_files), $(wildcard *))
zipfile_name = Final_Project.zip
temp_directory = zipper

$(zipfile_name): $(files)
	zip -r $@ $^

test: $(zipfile_name)
	@mkdir $(temp_directory)
	unzip -d $(temp_directory) $^

clean:
	rm -rf $(temp_directory)
	rm $(zipfile_name)