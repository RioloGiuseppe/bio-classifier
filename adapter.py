import glob

def processFile(filename):
    print "Processing", filename

    parts = []
    i = 1
    for line in open(filename):
        part = str(i) + ":" + line.split()[1]
        parts.append(part)
        i = i + 1
    return " ".join(parts)

if __name__ == "__main__":
    with open("data/dataset.txt","w+") as out:
        for file in glob.iglob("./data/files/*"):
            isTumor = 1 if "Tumor" in file else 0
            out.write(str(isTumor))
            out.write(" ")
            out.write(processFile(file))
            out.write("\n")