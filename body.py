import csv
file = open('leetcodequestions.csv', 'r')
reader = csv.reader(file)
data = list(reader)
questionid = int() # the id of the question to be corrected

for row in data:
    if str(row[0]) == questionid:
        question_name = row[1]
        question_topics = row[5]
        question_difficulty = row[6]

