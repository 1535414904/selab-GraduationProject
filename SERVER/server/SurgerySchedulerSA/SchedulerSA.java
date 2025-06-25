import java.util.*;

public class SchedulerSA {

    public List<OperatingRoom> currentSolution;
    public List<OperatingRoom> bestSolution;
    public double temperature;
    public int maxIterations;

    // 初始化模擬退火演算法
    public SchedulerSA(List<OperatingRoom> initialSolution, int maxIterations) {
        this.currentSolution = cloneSolution(initialSolution);
        this.bestSolution = cloneSolution(initialSolution);
        this.maxIterations = maxIterations;
        this.temperature = 1000.0;
    }

    // 執行模擬退火演算法
    public void run() {
        for (int i = 0; i < maxIterations; i++) { // 每次迭代
            List<OperatingRoom> neighbor = generateNeighbor(currentSolution); // 生成鄰域解
            int delta = cost(neighbor) - cost(currentSolution); // 計算成本差異

            if (delta < 0 || Math.random() < Math.exp(-delta / temperature)) { // 比較好就接受，如果是更差的解，則以一定機率接受。機率為
                                                                               // Math.exp(-delta / temperature)
                currentSolution = neighbor; // 更新當前解
                if (cost(currentSolution) < cost(bestSolution)) { // 如果當前解更好，則更新最佳解
                    bestSolution = cloneSolution(currentSolution); // 更新最佳解
                }
            }

            temperature *= 0.97; // 降低溫度
        }
    }

    // 擾動
    private List<OperatingRoom> generateNeighbor(List<OperatingRoom> solution) {
        List<OperatingRoom> neighbor = cloneSolution(solution);
        Random rand = new Random();

        List<OperatingRoom> nonEmptyRooms = new ArrayList<>();
        for (OperatingRoom room : neighbor) {
            if (!room.surgeries.isEmpty()) {
                nonEmptyRooms.add(room);
            }
        }

        if (nonEmptyRooms.isEmpty())
            return neighbor;

        OperatingRoom fromRoom = nonEmptyRooms.get(rand.nextInt(nonEmptyRooms.size()));
        int fromIndex = rand.nextInt(fromRoom.surgeries.size());
        Surgery moved = fromRoom.surgeries.remove(fromIndex);

        // 根據 req 選擇目標房
        List<OperatingRoom> candidateRooms = new ArrayList<>();
        for (OperatingRoom room : neighbor) {
            if (room != fromRoom) {
                if ("Y".equalsIgnoreCase(moved.req.trim())) {
                    if (room.isOrthRoom) {
                        candidateRooms.add(room);
                    }
                } else {
                    candidateRooms.add(room);
                }

            }
        }

        if (candidateRooms.isEmpty()) {
            fromRoom.surgeries.add(fromIndex, moved);
            return neighbor;
        }

        OperatingRoom toRoom = candidateRooms.get(rand.nextInt(candidateRooms.size()));
        int toIndex = rand.nextInt(toRoom.surgeries.size() + 1);
        toRoom.surgeries.add(toIndex, moved);
        moved.roomId = toRoom.roomId;
        return neighbor;
    }

    public int cost(List<OperatingRoom> solution) {
        int total = 0;
        for (OperatingRoom room : solution) {
            // calculateTotalTime() 已含 transitionTime
            int overtime = room.calculateOvertime();
            int overlimit = room.calculateOverlimit();
            total += 5 * overtime + 100 * overlimit;
        }
        return total;
    }

    private List<OperatingRoom> cloneSolution(List<OperatingRoom> original) {
        List<OperatingRoom> copy = new ArrayList<>();
        for (OperatingRoom r : original) {
            OperatingRoom newRoom = new OperatingRoom(r.roomId, r.regularTime, r.overtimeLimit, r.transitionTime);
            newRoom.isOrthRoom = r.isOrthRoom;
            for (Surgery s : r.surgeries) {
                Surgery clone = new Surgery(
                        s.surgeryDateTime,
                        s.surgeryId,
                        s.patientId,
                        s.specialty,
                        s.surgeon,
                        s.roomId,
                        s.anesthesia,
                        s.duration,
                        s.req,
                        s.order);
                newRoom.surgeries.add(clone);
            }
            copy.add(newRoom);
        }
        return copy;
    }
}
