import { ParticipantInRoom, Statement } from "delib-npm";
import { FC } from "react";

// import { useLanguage } from "@/controllers/hooks/useLanguages";
import RoomParticipantBadge from "../roomParticipantBadge/RoomParticipantBadge";
import styles from "./Room.module.scss";

interface Props {
  participants: ParticipantInRoom[];
  roomNumber: number;
  topic: Statement;
}

const Room: FC<Props> = ({ participants, roomNumber, topic }) => {
	// const { t } = useLanguage();

	return (
		<div className={styles.room}>
			<div className={styles.roomNumber}>room: {roomNumber}</div>
			<div className={styles.topic}>topic: {topic.statement}</div>
			<div className={styles.participants}>
				{participants.map((participant) => {
					return (
						<RoomParticipantBadge
							key={participant.user.uid}
							participant={participant}
						/>
					);
				})}
			</div>
		</div>
	);
};

export default Room;
