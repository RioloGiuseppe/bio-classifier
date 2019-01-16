import glob

def processFile(filename):
    print "Processing", filename

    parts = []
    for line in open(filename):
        part = ":".join(line.split())
        parts.append(part)
    
    return " ".join(parts)

if __name__ == "__main__":
    with open("data/out.txt","w+") as out:
        for file in glob.iglob("./data/files/*"):
            isTumor = 1 if "Tumor" in file else 0
            out.write(str(isTumor))
            out.write(" ")
            out.write(processFile(file))
            out.write("\n")