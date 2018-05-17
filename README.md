# node-unity-guid-utils
Find all the instances of a set of guids in unity scene or prefab (yaml) files and replace them with a set of mapped guids. Common js yaml parsers can't read or write unity's yaml for scenes and prefabs because of the use of tags. This library sidesteps yaml issues by making replacements using regular expressions.
