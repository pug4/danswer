from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from sqlalchemy.orm import Session

from danswer.auth.users import current_user
from danswer.db.engine import get_session
from danswer.db.models import User
from danswer.db.notification import dismiss_notification
from danswer.db.notification import get_notification_by_id
from danswer.db.notification import get_notifications
from danswer.server.settings.models import Notification as NotificationModel
from danswer.utils.logger import setup_logger

logger = setup_logger()

router = APIRouter(prefix="/notifications")


@router.get("")
def get_notifications_api(
    user: User = Depends(current_user),
    db_session: Session = Depends(get_session),
) -> list[NotificationModel]:
    notificatinos = [
        NotificationModel.from_model(notif)
        for notif in get_notifications(user, db_session, include_dismissed=False)
    ]
    return notificatinos


@router.post("/{notification_id}/dismiss")
def dismiss_notification_endpoint(
    notification_id: int,
    user: User | None = Depends(current_user),
    db_session: Session = Depends(get_session),
) -> None:
    try:
        notification = get_notification_by_id(notification_id, user, db_session)
    except PermissionError:
        raise HTTPException(
            status_code=403, detail="Not authorized to dismiss this notification"
        )
    except ValueError:
        raise HTTPException(status_code=404, detail="Notification not found")

    dismiss_notification(notification, db_session)
