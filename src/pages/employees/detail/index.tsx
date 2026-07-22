import { useParams } from "react-router-dom";
import ProfileView from "../../../sections/profile/ProfileView";

function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();

  return <ProfileView targetEmployeeId={id} />;
}

export default EmployeeDetailPage;
