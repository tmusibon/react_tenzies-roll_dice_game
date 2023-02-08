import "./App.css";

const Die = ({ isHeld, holdDice, value }) => {
  const styles = {
    backgroundColor: isHeld ? "#59E391" : "white",
  };
  return (
    <div className="die-face" style={styles} onClick={holdDice}>
      <h2 className="die-num">{value}</h2>
    </div>
  );
};
export default Die;
